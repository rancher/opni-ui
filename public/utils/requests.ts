import moment from "moment";
import Axios from 'axios';
import { Granularity, Range } from "./time";
import _ from "lodash";

export type Severity = 'anomolous' | 'suspicious' | 'normal';

export interface Anomaly {
  timestamp: number;
  count: number;
}

export interface AnomalyByComponent { [key: string]: Anomaly[] };

export interface Insight {
  anomaly: number,
  suspicious: number,
  normal: number,
  timestamp: number
};

export interface BasicBreakdown {
  clusterId: string;
  name: string;
  anomaly: number;
  suspicious: number;
  normal: number;
  normalSparkline: number[];
  normalSparklineGlobalMax;
}

export interface WorkloadBreakdown extends BasicBreakdown {
  namespace: string;
}

export interface PodBreakdown extends BasicBreakdown {
  eventNormal: number;
  eventWarning: number;
}


export interface Log {
  id: number;
  timestamp: number;
  log: string;
  level: string;
  component: string;
}

export type LogType = 'workload' | 'controlplane' | 'rancher' | 'event';

export async function getInsights(range: Range, granularity: Granularity, clusterId: string, logType?: LogType): Promise<Insight[]> {
  const results = await search(getInsightsQuery(range, granularity, clusterId, logType));

  const buckets = results.rawResponse?.aggregations?.granularity_results?.buckets || [];
  return buckets.map((bucket) => {
    const counts = extractCounts(bucket.anomaly_level.buckets);

    return {
      ...counts,
      timestamp: bucket.key
    }
  });
}

export async function getRancherInsights(range: Range, granularity: Granularity, clusterId: string): Promise<Insight[]> {
  return getInsights(range, granularity, clusterId, 'rancher');
}

export async function getControlPlaneInsights(range: Range, granularity: Granularity, clusterId: string): Promise<Insight[]> {
  return getInsights(range, granularity, clusterId, 'controlplane');
}

export async function getClusterIds() {
  const results = await search({
    "size": 0,
    "aggs" : {
        "clusters" : {
            "terms" : { "field" : "cluster_id" }
        }
    }
  });

  return results.rawResponse.aggregations.clusters.buckets.map(bucket => bucket.key);
}

export async function getControlPlaneBreakdown(range: Range, clusterId: string): Promise<BasicBreakdown[]> {
  const results = await search(getControlPlaneBreakdownQuery(range, clusterId));
  const clusters = results.rawResponse?.aggregations?.cluster_id?.buckets;

  return clusters.flatMap(cluster => {
    const buckets = cluster.component_name?.buckets || [];
    return buckets.map((bucket) => {
      return {
        ...extractCounts(bucket.anomaly_level.buckets),
        name: bucket.key,
        clusterId: cluster.key
      };
    });
  });
  
}

export async function getRancherBreakdown(range: Range, clusterId: string): Promise<BasicBreakdown[]> {
  const results = await search(getRancherBreakdownQuery(range, clusterId));
  const clusters = results.rawResponse?.aggregations?.cluster_id?.buckets;

  return clusters.flatMap(cluster => {
    const buckets = cluster.pod_name?.buckets || [];
    return buckets.map((bucket) => {
      return {
        ...extractCounts(bucket.anomaly_level.buckets),
        name: bucket.key,
        clusterId: cluster.key
      };
    });
  });
}

export async function getPodBreakdown(range: Range, clusterId: string): Promise<PodBreakdown[]> {
  const results = await search(getPodBreakdownQuery(range, clusterId));
  const breakdownLookup: { [key: string]: PodBreakdown } = {};
  const buckets = results.rawResponse?.aggregations?.bucket?.buckets || [];
  
  let globalMax = 0;

  buckets.forEach((bucket) => {
    const key = bucket.key.pod_name;
    const clusterId = bucket.key.cluster_id;
    const count = bucket.logs?.buckets[0].doc_count;

    breakdownLookup[key] = breakdownLookup[key] || { name: key, anomaly: 0, suspicious: 0, normal: 0, eventNormal: 0, eventWarning: 0, normalSparkline: [], normalSparklineGlobalMax: 0, clusterId };
    breakdownLookup[key]["normal"] = count;
    breakdownLookup[key].normalSparkline = bucket.logs?.buckets[0].sparkLine.buckets.map(b => b.doc_count);
    globalMax = Math.max(globalMax, ...breakdownLookup[key].normalSparkline);

    const events = bucket.events?.buckets || [];
    if (events.size > 0) {
      const eventLevels = bucket.events?.buckets[0].level?.buckets || [];
      eventLevels.forEach((level) => {
        const eventKey = "event" + level.key;
        const eventCount = level.doc_count;

        breakdownLookup[key][eventKey] = eventCount;
      });
    }
  });



  Object.values(breakdownLookup).forEach(breakdown => breakdown.normalSparklineGlobalMax = globalMax);

  return Object.values(breakdownLookup);
}

export async function getLogTypes(): Promise<String[]> {
  const results = await search(getLogTypeQuery());
  return results.rawResponse.aggregations?.log_type?.buckets.map(b => b.key);
}

export function getLogTypeQuery() {
  return {
    "size": 0,
    "aggs" : {
        "log_type" : {
            "terms" : { "field" : "log_type",  "size" : 500 }
        }
    }
  };
}

export async function getNamespaceBreakdown(range: Range, clusterId: string): Promise<BasicBreakdown[]> {
  const results = await search(getNamespaceBreakdownQuery(range, clusterId));

  const breakdownLookup: { [key: string]: BasicBreakdown } = {};
  const buckets = results.rawResponse?.aggregations?.bucket?.buckets || [];
  let globalMax = 0;
  buckets.forEach((bucket) => {
    const key = bucket.key.namespace_name;
    const clusterId = bucket.key.cluster_id;
    const level = bucket.key.anomaly_level.toLowerCase();
    const count = bucket.doc_count

    breakdownLookup[key] = breakdownLookup[key] || { name: key, anomaly: 0, suspicious: 0, normal: 0, normalSparkline: [], normalSparklineGlobalMax: 0, clusterId };
    breakdownLookup[key][level] = count;
    breakdownLookup[key].normalSparkline = bucket.sparkLine.buckets.map(b => b.doc_count);
    globalMax = Math.max(globalMax, ...breakdownLookup[key].normalSparkline);
  });

  Object.values(breakdownLookup).forEach(breakdown => breakdown.normalSparklineGlobalMax = globalMax);

  return Object.values(breakdownLookup);
}

export async function getAnomalies(range: Range, granularity: Granularity, clusterId: string): Promise<AnomalyByComponent> {
  const results = await search(getAnomaliesQuery(range, granularity, clusterId));
  const byComponent: AnomalyByComponent = {};
  const buckets = results.rawResponse?.aggregations?.histogram?.buckets;

  buckets.forEach(bucket => {
    const timestamp = bucket.key;
    const components = bucket.filtered.buckets.anomaly.component.buckets;
    components.forEach(component => {
      byComponent[component.key] = byComponent[component.key] || [];
      byComponent[component.key].push({
        timestamp,
        count: component.doc_count
      })
    });
  });

  return byComponent;
}

// export async function getLogs(): Promise<Log[]> {
//   const results = await search(getLogsQuery(range));

//   console.log(results);

//   return results.rawResponse.hits.hits.map(hit => ({
//     id: hit._id,
//     timestamp: hit._source.timestamp,
//     log: hit._source.log,
//     level: hit._source.anomaly_level,
//     component: hit._source.kubernetes_component
//   }));
// }

async function createInsights(): Promise<Insight[]> {
  await randomDelay();

  const now = moment();

  return [...Array(24)].map((_, i): Insight => ({
    anomaly: Math.random() * 20,
    suspicious: Math.random() * 10,
    normal: Math.random() * 10,
    timestamp: now.add(i, 'hours').valueOf()
  }));
}

function extractCounts(innerBuckets = []) {
  const counts = {
    anomaly: 0,
    suspicious: 0,
    normal: 0,
  };

  innerBuckets.forEach(bucket => {
    counts[bucket.key.toLowerCase()] += bucket.doc_count;
  });

  return counts;
}

function getSearchUrl() {
  return window.location.href.replace(/\/app\/.*/, '/internal/search/opensearch');
}

async function search(query) {
  return (await Axios.post(
    getSearchUrl(),
    {
      params: {
        index: 'logs*',
        body: query
      }
    },
    {
      headers: {
        'osd-xsrf': 'opensearchDashboards',
      }
    }
  )).data;
}

function must(clusterId, logType?: LogType) {
  const musts = [];

  if (clusterId !== 'all') {
    musts.push({match: {"cluster_id": clusterId}});
  }

  if (logType) {
    musts.push({match: {"log_type": logType}})
  }

  return musts;
}

function getInsightsQuery(range: Range, granularity: Granularity, clusterId: string, logType?: LogType) {
  return {
    "query": {
      "bool": {
        "filter": [{ "range": { "time": { "gte": range.start.format(), "lte": range.end.format() } } }],
        "must": must(clusterId, logType),
      }
    },
    "aggs": {
      "granularity_results": {
        "date_histogram": { "field": "time", "fixed_interval": granularity },
        "aggs": { "anomaly_level": { "terms": { "field": "anomaly_level" } } },
      }
    },
  }
}

function getAnomaliesQuery(range: Range, granularity: Granularity, clusterId: string) {
  return {
    "size": 0,
    "aggs": {
      "histogram": {
        "date_histogram": {
          "field": "time",
          "fixed_interval": granularity,
          "min_doc_count": 1
        },
        "aggs": {
          "filtered": {
            "filters": {
              "filters": {
                "anomaly": {
                  "bool": {
                    "must": [{
                      "query_string": {
                        "query": "anomaly_level:Anomaly",
                        "analyze_wildcard": true
                      }
                    }]
                  }
                }
              }
            },
            "aggs": {
              "component": {
                "terms": {
                  "field": "kubernetes_component",
                  "order": {
                    "_count": "asc"
                  },
                }
              }
            }
          }
        }
      }
    },
    "query": {
      "bool": {
        "must": [...must(clusterId), {"exists": { "field": "kubernetes_component"}}],
        "must_not": [{"term": {"kubernetes_component": ""}}],
        "filter": [{
          "range": {
            "time": {
              "gte": range.start.format(), 
              "lte": range.end.format(),
              "format": "strict_date_optional_time"
            }
          }
        }]
      }
    }
  };
}

function getControlPlaneBreakdownQuery(range: Range, clusterId: string) {
  return {
    "query": {
        "bool": {
            "filter": [{"range": {"time": {"gte": range.start, "lte": range.end}}}],
            "must": [...must(clusterId), {"match": {"log_type": "controlplane"}}],
        }
    },
    "aggs": {
        "cluster_id": {
          "terms": {"field": "cluster_id"},
          "aggs": {
            "component_name": {
              "terms": {"field": "kubernetes_component"},
                "aggs": {
                    "anomaly_level": {"terms": {"field": "anomaly_level"}}
                },
            }
          }
        }
    },
  }
}

function getRancherBreakdownQuery(range: Range, clusterId: string) {
  return {
    "query": {
        "bool": {
            "filter": [{"range": {"time": {"gte": range.start, "lte": range.end}}}],
            "must": [...must(clusterId), {"match": {"log_type": "rancher"}}],
        }
    },
    "aggs": {
      "cluster_id": {
        "terms": {"field": "cluster_id"},
        "aggs": {
          "pod_name": {
            "terms": {"field": "kubernetes.pod_name.keyword"},
            "aggs": {
              "anomaly_level": {"terms": {"field": "anomaly_level"}}
            },
          }
        }
      }
    },
  }
}

function getNamespaceBreakdownQuery(range: Range, clusterId: string) {
  return {
    "query": {
        "bool": {
            "must": [...must(clusterId), {"regexp": {"kubernetes.namespace_name": ".+"}}, {"match": {"log_type": "workload"}}],
            "filter": [{"range": {"time": {"gte": range.start, "lte": range.end}}}],
        }
    },
    "aggs": {
        "bucket": {
            "composite": {
                "size": 1000,
                "sources": [{"cluster_id": {"terms": {"field":"cluster_id"}}}, {"namespace_name": {"terms": {"field":"kubernetes.namespace_name.keyword"}}}, {"anomaly_level": {"terms": {"field": "anomaly_level"}}}],
            },
            "aggs": {
              "sparkLine": {
                "date_histogram": { "field": "time", "fixed_interval": "10m" },
                "aggs": { "anomaly_level": { "terms": { "field": "anomaly_level" } } },
              }
            }
        }
    }
  }
}

function getPodBreakdownQuery(range: Range, clusterId: string) {
  return {
    "size": 0,
    "query": {
        "bool": {
            "must": [...must(clusterId), {"regexp": {"pod_name": ".+"}}],
            "should": [{"match": {"log_type": "workload"}},{"match": {"log_type": "event"}}],
            "minimum_should_match": 1,
            "filter": [{"range": {"time": {"gte": range.start, "lte": range.end}}}],
        }
    },
    "aggs": {
      "bucket": {
        "composite": {
            "size": 1000,
            "sources": [{"cluster_id": {"terms": {"field":"cluster_id"}}}, {"pod_name": {"terms": {"field": "kubernetes.pod_name.keyword"}}}],
        },
        "aggs": {
          "logs": {
            "terms": {"field": "log_type", "include": "workload"},
            "aggs": {
              "sparkLine": {
                "date_histogram": { "field": "time", "fixed_interval": "10m" },
                "aggs": { "anomaly_level": { "terms": { "field": "anomaly_level" } } },
              }
            }
          },
          "events": {
            "terms": {"field": "log_type", "include": "event"},
            "aggs": {
              "level": {
                "terms": {"field": "type.keyword"}
              }
            }
          }
        }
      }
    }
  }
}

function getLogsQuery(range: Range) {
  return {
    "aggs": {
      "2": {
        "date_histogram": {
          "field": "time",
          "fixed_interval": "30m",
          "time_zone": "America/Chicago",
          "min_doc_count": 1
        }
      }
    },
    "query": {
      "bool": {
        "must": [],
        "filter": [{
          "match_all": {}
        }, {
          "match_phrase": {
            "is_control_plane_log": true
          }
        }, {
          "range": {
            "time": {
              "gte": range.start, "lte": range.end,
              "format": "strict_date_optional_time"
            }
          }
        }],
        "should": [],
        "must_not": [{
          "match_phrase": {
            "anomaly_level": "Normal"
          }
        }]
      }
    }
  }
}

async function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(undefined), ms);
  });
}

async function randomDelay() {
  const ms = 500 + (Math.random() * 2000);

  return delay(ms);
}
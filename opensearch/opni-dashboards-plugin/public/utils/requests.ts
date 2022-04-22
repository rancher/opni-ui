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
  name: string;
  anomaly: number;
  suspicious: number;
  normal: number;
}

export interface WorkloadBreakdown extends BasicBreakdown {
  namespace: string;
}


export interface Log {
  id: number;
  timestamp: number;
  log: string;
  level: string;
  component: string;
}

export async function getInsights(range: Range, granularity: Granularity, clusterId: string): Promise<Insight[]> {
  const results = await search(getInsightsQuery(range, granularity, clusterId));

  const buckets = results.rawResponse?.aggregations?.granularity_results?.buckets || [];
  return buckets.map((bucket) => {
    const counts = extractCounts(bucket.anomaly_level.buckets);

    return {
      ...counts,
      timestamp: bucket.key
    }
  });
}

export async function getClusterIds() {
  const results = await search({
    "size": 0,
    "aggs" : {
        "clusters" : {
            "terms" : { "field" : "cluster_id.keyword" }
        }
    }
  });

  return results.rawResponse.aggregations.clusters.buckets.map(bucket => bucket.key);
}

export async function getControlPlaneBreakdown(range: Range, clusterId: string): Promise<BasicBreakdown[]> {
  const results = await search(getControlPlaneBreakdownQuery(range, clusterId));

  const buckets = results.rawResponse?.aggregations?.component_name?.buckets || [];
  return buckets.map((bucket) => {
    return {
      ...extractCounts(bucket.anomaly_level.buckets),
      name: bucket.key,
    };
  });
}

export async function getPodBreakdown(range: Range, clusterId: string): Promise<BasicBreakdown[]> {
  const results = await search(getPodBreakdownQuery(range, clusterId));

  const breakdownLookup: { [key: string]: BasicBreakdown } = {};
  const buckets = results.rawResponse?.aggregations?.bucket?.buckets || [];
  buckets.forEach((bucket) => {
    const key = bucket.key.pod_name;
    const level = bucket.key.anomaly_level.toLowerCase();
    const count = bucket.doc_count

    breakdownLookup[key] = breakdownLookup[key] || { name: key, anomaly: 0, suspicious: 0, normal: 0 };
    breakdownLookup[key][level] = count;
  });

  return Object.values(breakdownLookup);
}

export async function getNamespaceBreakdown(range: Range, clusterId: string): Promise<BasicBreakdown[]> {
  const results = await search(getNamespaceBreakdownQuery(range, clusterId));

  const breakdownLookup: { [key: string]: BasicBreakdown } = {};
  const buckets = results.rawResponse?.aggregations?.bucket?.buckets || [];
  buckets.forEach((bucket) => {
    const key = bucket.key.namespace_name;
    const level = bucket.key.anomaly_level.toLowerCase();
    const count = bucket.doc_count

    breakdownLookup[key] = breakdownLookup[key] || { name: key, anomaly: 0, suspicious: 0, normal: 0 };
    breakdownLookup[key][level] = count;
  });

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

export async function getWorkloadBreakdown(): Promise<WorkloadBreakdown[]> {
  return createWorkloadBreakdown();
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

async function createBasicBreakdown(): Promise<BasicBreakdown[]> {
  await randomDelay();

  return [
    {
      name: 'kubelet',
      anomaly: 0,
      suspicious: 2,
      normal: 197000
    },
    {
      name: 'kube-controller-manager',
      anomaly: 0,
      suspicious: 0,
      normal: 121000
    },
    {
      name: 'kube-apiserver',
      anomaly: 0,
      suspicious: 0,
      normal: 85000
    },
    {
      name: 'kube-proxy',
      anomaly: 0,
      suspicious: 0,
      normal: 62000
    },
    {
      name: 'etcd',
      anomaly: 0,
      suspicious: 0,
      normal: 50000
    }
  ];
}

async function createWorkloadBreakdown(): Promise<WorkloadBreakdown[]> {
  await randomDelay();

  return [
    {
      name: 'kubelet',
      namespace: 'super-socks',
      anomaly: 0,
      suspicious: 2,
      normal: 197000
    },
    {
      name: 'kube-controller-manager',
      namespace: 'super-socks',
      anomaly: 0,
      suspicious: 0,
      normal: 121000
    },
    {
      name: 'kube-apiserver',
      namespace: 'system',
      anomaly: 0,
      suspicious: 0,
      normal: 85000
    },
    {
      name: 'kube-proxy',
      namespace: 'system',
      anomaly: 0,
      suspicious: 0,
      normal: 62000
    },
    {
      name: 'etcd',
      namespace: 'default',
      anomaly: 0,
      suspicious: 0,
      normal: 50000
    }
  ]
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

function must(clusterId) {
  return clusterId === 'all' ? [] : [{match: {"cluster_id.keyword": clusterId}}];
}

function getInsightsQuery(range: Range, granularity: Granularity, clusterId: string) {
  return {
    "query": {
      "bool": {
        "filter": [{ "range": { "timestamp": { "gte": range.start.format(), "lte": range.end.format() } } }],
        "must": must(clusterId),
      }
    },
    "aggs": {
      "granularity_results": {
        "date_histogram": { "field": "timestamp", "fixed_interval": granularity },
        "aggs": { "anomaly_level": { "terms": { "field": "anomaly_level.keyword" } } },
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
                  "field": "kubernetes_component.keyword",
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
        "must": must(clusterId),
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
            "filter": [{"range": {"timestamp": {"gte": range.start, "lte": range.end}}}],
            "must": [...must(clusterId), {"match": {"is_control_plane_log": "true"}}],
        }
    },
    "aggs": {
        "component_name": {
            "terms": {"field": "kubernetes_component.keyword"},
            "aggs": {
                "anomaly_level": {"terms": {"field": "anomaly_level.keyword"}}
            },
        }
    },
  }
}

function getNamespaceBreakdownQuery(range: Range, clusterId: string) {
  return {
    "query": {
        "bool": {
            "must": [...must(clusterId), {"match": {"is_control_plane_log": "false"}}, {"regexp": {"kubernetes.namespace_name": ".+"}}],
            "filter": [{"range": {"timestamp": {"gte": range.start, "lte": range.end}}}],
        }
    },
    "aggs": {
        "bucket": {
            "composite": {
                "size": 1000,
                "sources": [{"namespace_name": {"terms": {"field":"kubernetes.namespace_name.keyword"}}}, {"anomaly_level": {"terms": {"field": "anomaly_level.keyword"}}}],
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
            "must": [...must(clusterId), {"match": {"is_control_plane_log": "false"}}, {"regexp": {"kubernetes.namespace_name": ".+"}}],
            "filter": [{"range": {"timestamp": {"gte": range.start, "lte": range.end}}}],
        }
    },
    "aggs": {
        "bucket": {
            "composite": {
                "size": 1000,
                "sources": [{"namespace_name": {"terms": {"field":"kubernetes.namespace_name.keyword"}}}, {"pod_name": {"terms": {"field": "kubernetes.pod_name.keyword"}}}, {"anomaly_level": {"terms": {"field": "anomaly_level.keyword"}}}],
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
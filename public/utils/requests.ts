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

export interface K8SEvent {
  type: EventType;
  cause: string;
  summary: string;
  source: string;
  details: string;
  timestamp: number;
}

export interface LogTemplate {
  template: string;
  templateId: number;
  count: number;
  log: string;
}

export interface BasicBreakdown {
  clusterId: string;
  name: string;
  anomaly: number;
  suspicious: number;
  normal: number;
  keywords: number;
  normalSparkline: number[];
  normalSparklineGlobalMax;
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

export type LogType = 'workload' | 'controlplane' | 'rancher';
export type EventType = 'Normal' | 'Warning';

export async function getInsights(range: Range, granularity: Granularity, clusterId: string, keywords: string[], logType?: LogType): Promise<Insight[]> {
  const insightsPromise = search(getInsightsQuery(range, granularity, clusterId, logType));
  const keywordsPromise = search(getKeywordInsightsQuery(range, granularity, clusterId, keywords, logType));

  const insightsBuckets = (await insightsPromise).rawResponse?.aggregations?.granularity_results?.buckets || [];
  const keywordsBuckets = (await keywordsPromise).rawResponse?.aggregations?.granularity_results?.buckets || [];

  const result = insightsBuckets.map((insightBucket, i) => {
    const keywordBucket = keywordsBuckets[i];
    const counts = extractCounts(insightBucket.anomaly_level.buckets);

    return {
      ...counts,
      keywords: (keywordBucket && keywordBucket.key === insightBucket.key) ? keywordBucket.doc_count : 0,
      timestamp: insightBucket.key
    }
  });

  return result;
}

export async function getK8sEvents(range: Range, clusterId: string, type?: EventType): Promise<K8SEvent[]> {
  const results = await search(getK8sEventsQuery(range, clusterId, type));

  const hits = results.rawResponse?.hits?.hits || [];

  return hits.map(h => ({
    cause: h._source.reason,
    summary: h._source.message,
    timestamp: moment(h._source.time).valueOf(),
    type: h._source.type,
    source: `${h._source.involvedObject.kind}: ${h._source.involvedObject.namespace}/${h._source.involvedObject.name}`
  }));
}

export async function getRancherInsights(range: Range, granularity: Granularity, clusterId: string, keywords: string[]): Promise<Insight[]> {
  return getInsights(range, granularity, clusterId, keywords, 'rancher');
}

export async function getControlPlaneInsights(range: Range, granularity: Granularity, clusterId: string, keywords: string[]): Promise<Insight[]> {
  return getInsights(range, granularity, clusterId, keywords, 'controlplane');
}

export async function getClusterIds() {
  const results = await search({
    "size": 0,
    "aggs": {
      "clusters": {
        "terms": { "field": "cluster_id" }
      }
    }
  });

  return results.rawResponse.aggregations?.clusters.buckets.map(bucket => bucket.key) || [];
}

export async function getControlPlaneBreakdown(range: Range, clusterId: string, keywords: string[]): Promise<BasicBreakdown[]> {
  const breakdownPromise = search(getControlPlaneBreakdownQuery(range, clusterId));
  const keywordsBreakdownPromise = search(getControlPlaneKeywordsBreakdownQuery(range, clusterId, keywords));
  const clusters = (await breakdownPromise).rawResponse?.aggregations?.cluster_id?.buckets || [];
  const keywordsClusters = (await keywordsBreakdownPromise).rawResponse?.aggregations?.cluster_id?.buckets || [];

  return clusters.flatMap(cluster => {
    const keywordsCluster = keywordsClusters.find(c => c.key === cluster.key) || {};

    const buckets = cluster.component_name?.buckets || [];
    const keywordsBuckets = keywordsCluster.component_name?.buckets || [];

    return buckets.map((bucket) => {
      const keywordsBucket = keywordsBuckets.find(b => b.key === bucket.key);
      return {
        ...extractCounts(bucket.anomaly_level.buckets),
        keywords: keywordsBucket?.doc_count || 0,
        name: bucket.key,
        clusterId: cluster.key
      };
    });
  });

}

export async function getRancherBreakdown(range: Range, clusterId: string, keywords: string[]): Promise<BasicBreakdown[]> {
  const breakdownPromise = search(getRancherBreakdownQuery(range, clusterId));
  const keywordsBreakdownPromise = search(getRancherKeywordsBreakdownQuery(range, clusterId, keywords));
  const clusters = (await breakdownPromise).rawResponse?.aggregations?.cluster_id?.buckets || [];
  const keywordsClusters = (await keywordsBreakdownPromise).rawResponse?.aggregations?.cluster_id?.buckets || [];


  return clusters.flatMap(cluster => {
    const keywordsCluster = keywordsClusters.find(c => c.key === cluster.key) || {};

    const buckets = cluster.pod_name?.buckets || [];
    const keywordsBuckets = keywordsCluster.pod_name?.buckets || [];

    return buckets.map((bucket) => {
      const keywordsBucket = keywordsBuckets.find(b => b.key === bucket.key);
      return {
        ...extractCounts(bucket.anomaly_level.buckets),
        keywords: keywordsBucket?.doc_count || 0,
        name: bucket.key,
        clusterId: cluster.key
      };
    });
  });
}

export async function getPodBreakdown(range: Range, clusterId: string, keywords: string[]): Promise<BasicBreakdown[]> {
  const breakdownPromise = search(getPodBreakdownQuery(range, clusterId));
  const keywordsBreakdownPromise = search(getPodKeywordsBreakdownQuery(range, clusterId, keywords));
  const buckets = (await breakdownPromise).rawResponse?.aggregations?.bucket?.buckets || [];
  const keywordsBuckets = (await keywordsBreakdownPromise).rawResponse?.aggregations?.bucket?.buckets || [];

  const breakdownLookup: { [key: string]: BasicBreakdown } = {};
  let globalMax = 0;

  buckets.forEach((bucket) => {
    const key = bucket.key.pod_name;
    const clusterId = bucket.key.cluster_id;
    const level = bucket.key.anomaly_level.toLowerCase();
    const count = bucket.doc_count;
    const keywordBucket = keywordsBuckets.find(b => b.key.pod_name === key && b.key.cluster_id === clusterId) || {};

    breakdownLookup[key] = breakdownLookup[key] || { name: key, anomaly: 0, suspicious: 0, normal: 0, normalSparkline: [], normalSparklineGlobalMax: 0, clusterId };
    breakdownLookup[key][level] = count;
    breakdownLookup[key].keywords = keywordBucket.doc_count || 0;
    breakdownLookup[key].normalSparkline = bucket.sparkLine.buckets.map(b => b.doc_count);
    globalMax = Math.max(globalMax, ...breakdownLookup[key].normalSparkline);
  });



  Object.values(breakdownLookup).forEach(breakdown => breakdown.normalSparklineGlobalMax = globalMax);

  return Object.values(breakdownLookup);
}

export async function getLogTemplates(range: Range, clusterId: string): Promise<LogTemplate[]> {
  const response = await search(getLogTemplatesQuery(range, clusterId));

  return response.rawResponse.aggregations.templates.buckets.map(bucket => ({
    template: bucket.include_source.hits.hits[0]._source.template_matched,
    templateId: bucket.key,
    count: bucket.doc_count,
    log: bucket.include_source.hits.hits[0]._source.log
  }));
}

export async function getLogTypes(): Promise<String[]> {
  const results = await search(getLogTypeQuery());
  return results.rawResponse.aggregations?.log_type?.buckets.map(b => b.key) || [];
}

export function getLogTypeQuery() {
  return {
    "size": 0,
    "aggs": {
      "log_type": {
        "terms": { "field": "log_type", "size": 500 }
      }
    }
  };
}

export async function getNamespaceBreakdown(range: Range, clusterId: string, keywords: string[]): Promise<BasicBreakdown[]> {
  const breakdownPromise = search(getNamespaceBreakdownQuery(range, clusterId));
  const keywordsBreakdownPromise = search(getNamespaceKeywordsBreakdownQuery(range, clusterId, keywords));
  const buckets = (await breakdownPromise).rawResponse?.aggregations?.bucket?.buckets || [];
  const keywordsBuckets = (await keywordsBreakdownPromise).rawResponse?.aggregations?.bucket?.buckets || [];

  const breakdownLookup: { [key: string]: BasicBreakdown } = {};
  let globalMax = 0;
  buckets.forEach((bucket) => {
    const key = bucket.key.namespace_name;
    const clusterId = bucket.key.cluster_id;
    const level = bucket.key.anomaly_level.toLowerCase();
    const count = bucket.doc_count;
    const keywordBucket = keywordsBuckets.find(b => b.key.namespace_name === key && b.key.cluster_id === clusterId) || {};

    breakdownLookup[key] = breakdownLookup[key] || { name: key, anomaly: 0, suspicious: 0, normal: 0, normalSparkline: [], normalSparklineGlobalMax: 0, clusterId };
    breakdownLookup[key][level] = count;
    breakdownLookup[key].keywords = keywordBucket.doc_count || 0;
    breakdownLookup[key].normalSparkline = bucket.sparkLine.buckets.map(b => b.doc_count);
    globalMax = Math.max(globalMax, ...breakdownLookup[key].normalSparkline);
  });

  Object.values(breakdownLookup).forEach(breakdown => breakdown.normalSparklineGlobalMax = globalMax);

  return Object.values(breakdownLookup);
}

export async function getAnomalies(range: Range, granularity: Granularity, clusterId: string): Promise<AnomalyByComponent> {
  const results = await search(getAnomaliesQuery(range, granularity, clusterId));
  const byComponent: AnomalyByComponent = {};
  const buckets = results.rawResponse?.aggregations?.histogram?.buckets || [];

  console.log('dd', results);

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

  innerBuckets.forEach((bucket: any) => {
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
    musts.push({ match: { "cluster_id": clusterId } });
  }

  if (logType) {
    musts.push({ match: { "log_type": logType } })
  }

  return musts;
}

function getInsightsQuery(range: Range, granularity: Granularity, clusterId: string, logType?: LogType) {
  return {
    "query": {
      "bool": {
        "filter": [
          { "range": { "time": { "gte": range.start.format(), "lte": range.end.format() } } }
        ],

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

function mustKeywords(keywords: string[]) {
  return keywords.length > 0
    ? [{
      "bool": {
        "should": keywords.map(keyword => ({ "match": { "log": keyword } })),
        "minimum_should_match": 1
      }
    }]
    : [];
}

function getKeywordInsightsQuery(range: Range, granularity: Granularity, clusterId: string, keywords: string[], logType?: LogType) {
  return {
    "query": {
      "bool": {
        "filter": [{ "range": { "time": { "gte": range.start.format(), "lte": range.end.format() } } }],
        "must": [
          ...must(clusterId),
          ...mustKeywords(keywords)
        ]
      }
    },
    "size": 0,
    "aggs": {
      "granularity_results": {
        "date_histogram": { "field": "time", "fixed_interval": granularity },
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
        "must": [...must(clusterId), { "exists": { "field": "kubernetes_component" } }],
        "must_not": [{ "term": { "kubernetes_component": "" } }],
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
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
        "must": [...must(clusterId), { "match": { "log_type": "controlplane" } }],
      }
    },
    "aggs": {
      "cluster_id": {
        "terms": { "field": "cluster_id" },
        "aggs": {
          "component_name": {
            "terms": { "field": "kubernetes_component" },
            "aggs": {
              "anomaly_level": { "terms": { "field": "anomaly_level" } }
            },
          }
        }
      }
    },
  }
}

function getK8sEventsQuery(range: Range, clusterId: string, type?: EventType) {
  const typeMatch = type ? [{ "match": { "type": type } }] : [];
  return {
    "query": {
      "bool": {
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
        "must": [...must(clusterId), { "match": { "log_type": 'event' } }, ...typeMatch],
      }
    },
    size: 1000
  }
}

function getControlPlaneKeywordsBreakdownQuery(range: Range, clusterId: string, keywords: string[]) {
  return {
    "query": {
      "bool": {
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
        "must": [
          ...must(clusterId),
          ...mustKeywords(keywords),
          { "match": { "log_type": "controlplane" } }
        ],
      }
    },
    "size": 0,
    "aggs": {
      "cluster_id": {
        "terms": { "field": "cluster_id" },
        "aggs": {
          "component_name": {
            "terms": { "field": "kubernetes_component" },
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
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
        "must": [...must(clusterId), { "match": { "log_type": "rancher" } }],
      }
    },
    "aggs": {
      "cluster_id": {
        "terms": { "field": "cluster_id" },
        "aggs": {
          "pod_name": {
            "terms": { "field": "kubernetes.pod_name.keyword" },
            "aggs": {
              "anomaly_level": { "terms": { "field": "anomaly_level" } }
            },
          }
        }
      }
    },
  }
}

function getLogTemplatesQuery(range: Range, clusterId: string) {
  return {
    "query": {
      "bool": {
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
        "must": [...must(clusterId), { "match": { "log_type": "rancher" } }],
      }
    },
    "size": 0,
    "aggs": {
      "templates": {
        "terms": { "field": "template_cluster_id", "size": 1000 },
        "aggs": {
          "include_source": {
            "top_hits": {
              "size": 1,
              "_source": {
                "includes": ["template_matched", "log"]
              }
            }
          }
        }
      },
    },
  }
}

function getRancherKeywordsBreakdownQuery(range: Range, clusterId: string, keywords: string[]) {
  return {
    "query": {
      "bool": {
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
        "must": [
          ...must(clusterId),
          ...mustKeywords(keywords),
          { "match": { "log_type": "rancher" } }
        ],
      }
    },
    "size": 0,
    "aggs": {
      "cluster_id": {
        "terms": { "field": "cluster_id" },
        "aggs": {
          "pod_name": {
            "terms": { "field": "kubernetes.pod_name.keyword" },
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
        "must": [...must(clusterId), { "regexp": { "kubernetes.namespace_name.keyword": ".+" } }, { "match": { "log_type": "workload" } }],
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
      }
    },
    "aggs": {
      "bucket": {
        "composite": {
          "size": 1000,
          "sources": [{ "cluster_id": { "terms": { "field": "cluster_id" } } }, { "namespace_name": { "terms": { "field": "kubernetes.namespace_name.keyword" } } }, { "anomaly_level": { "terms": { "field": "anomaly_level" } } }],
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

function getNamespaceKeywordsBreakdownQuery(range: Range, clusterId: string, keywords: string[]) {
  return {
    "query": {
      "bool": {
        "must": [
          ...must(clusterId),
          ...mustKeywords(keywords),
          { "regexp": { "kubernetes.namespace_name.keyword": ".+" } },
          { "match": { "log_type": "workload" } }
        ],
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
      }
    },
    "aggs": {
      "bucket": {
        "composite": {
          "size": 1000,
          "sources": [{ "cluster_id": { "terms": { "field": "cluster_id" } } }, { "namespace_name": { "terms": { "field": "kubernetes.namespace_name.keyword" } } }],
        },
      }
    }
  }
}

function getPodBreakdownQuery(range: Range, clusterId: string) {
  return {
    "size": 0,
    "query": {
      "bool": {
        "must": [...must(clusterId), { "regexp": { "kubernetes.namespace_name.keyword": ".+" } }, { "match": { "log_type": "workload" } }],
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
      }
    },
    "aggs": {
      "bucket": {
        "composite": {
          "size": 1000,
          "sources": [{ "cluster_id": { "terms": { "field": "cluster_id" } } }, { "namespace_name": { "terms": { "field": "kubernetes.namespace_name.keyword" } } }, { "pod_name": { "terms": { "field": "kubernetes.pod_name.keyword" } } }, { "anomaly_level": { "terms": { "field": "anomaly_level" } } }],
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

function getPodKeywordsBreakdownQuery(range: Range, clusterId: string, keywords: string[]) {
  return {
    "size": 0,
    "query": {
      "bool": {
        "must": [
          ...must(clusterId),
          ...mustKeywords(keywords),
          { "regexp": { "kubernetes.namespace_name.keyword": ".+" } },
          { "match": { "log_type": "workload" } }
        ],
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
      }
    },
    "aggs": {
      "bucket": {
        "composite": {
          "size": 1000,
          "sources": [{ "cluster_id": { "terms": { "field": "cluster_id" } } }, { "namespace_name": { "terms": { "field": "kubernetes.namespace_name.keyword" } } }, { "pod_name": { "terms": { "field": "kubernetes.pod_name.keyword" } } }],
        },
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
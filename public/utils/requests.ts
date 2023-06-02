import moment from "moment";
import Axios from 'axios';
import { Granularity, Range } from "./time";
import _, { sortBy } from "lodash";

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

export interface Cluster {
  name: string;
  id: string;
  anomaly: number;
  normal: number;
  raw: number;
}

export interface LogTemplate {
  template: string;
  templateId: number;
  count: number;
  log: string;
}

export interface BasicBreakdown {
  clusterId: string;
  clusterName: string;
  name: string;
  anomaly: number;
  suspicious: number;
  normal: number;
  keywords: number;
}

export interface DeploymentBreakdown extends BasicBreakdown {
  namespace: string;
  deployment: string;
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

export type LogType = 'workload' | 'controlplane' | 'rancher' | 'longhorn';
export type EventType = 'Normal' | 'Warning';



export interface ClusterMetadata {
  id: string;
  name: string;
}

export type ClusterMetadataById = { [id: string]: ClusterMetadata };

export async function getClusterIds() {
  try {
    const results = await search({
      "size": 0,
      "aggs": {
        "clusters": {
          "terms": { "field": "cluster_id" }
        }
      }
    });

    return results.rawResponse.aggregations?.clusters.buckets.map(bucket => bucket.key) || [];
  } catch (ex) {
    return [];
  }
}

export async function getClusterMetadata(): Promise<ClusterMetadata[]> {
  try {
    const results = await search({ size: 1000 }, 'opni-cluster-metadata');

    const clusters = (results.rawResponse?.hits?.hits || []);

    if (clusters.length > 0) {
      return clusters
        .map(hit => ({
          id: hit._source.id,
          name: hit._source.name || hit._source.id
        }));
    }

    return (await getClusterIds()).map(id => ({
      id,
      name: id
    }));
  } catch (ex) {
    return (await getClusterIds()).map(id => ({
      id,
      name: id
    }));
  }
}

export async function getClusterMetadataById(): Promise<ClusterMetadataById> {
  const aggregation = {};

  const clusters = await getClusterMetadata();
  clusters.forEach(c => {
    aggregation[c.id] = c;
  });

  return aggregation;
}

export async function getClusters(range: Range): Promise<Cluster[]> {
  const [clustersResponse, clusterMetadataResponse] = await Promise.all([search(getClusterQuery(range)), getClusterMetadataById()]);

  const partialResult = clustersResponse.rawResponse.aggregations?.clusters.buckets.map(bucket => {
    const id = bucket.key;
    const metadata = clusterMetadataResponse[id];
    if (metadata) {
      delete clusterMetadataResponse[id];
    }
    console.log(bucket.anomaly_level?.buckets);
    return {
      id,
      name: metadata?.name || 'Unknown',
      anomaly: bucket.anomaly_level?.buckets?.find(b => b.key === 'Anomaly')?.doc_count || 0,
      normal: bucket.anomaly_level?.buckets?.find(b => b.key === 'Normal')?.doc_count || 0,
      raw: bucket.anomaly_level?.buckets?.find(b => b.key === '')?.doc_count || 0
    }
  }) || [];


  partialResult.push(...Object.entries(clusterMetadataResponse).map(([id, metadata]) => ({
    id,
    name: metadata.name,
    anomaly: 0,
    normal: 0,
    raw: 0
  })));

  return partialResult;
}


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
    cause: h._source['k8s.event.reason'],
    summary: h._source['Body.value'],
    timestamp: moment(Number.parseInt(`${h._source.time || 0}`)).valueOf(),
    type: h._source.SeverityText,
    source: `${h._source['k8s.object.kind']}: ${h._source['k8s.namespace.name']}/${h._source['k8s.event.name']}`
  }));
}

export async function getRancherInsights(range: Range, granularity: Granularity, clusterId: string, keywords: string[]): Promise<Insight[]> {
  return getInsights(range, granularity, clusterId, keywords, 'rancher');
}

export async function getLonghornInsights(range: Range, granularity: Granularity, clusterId: string, keywords: string[]): Promise<Insight[]> {
  return getInsights(range, granularity, clusterId, keywords, 'longhorn');
}

export async function getControlPlaneInsights(range: Range, granularity: Granularity, clusterId: string, keywords: string[]): Promise<Insight[]> {
  return getInsights(range, granularity, clusterId, keywords, 'controlplane');
}

export async function getControlPlaneBreakdown(range: Range, clusterId: string, keywords: string[], clusterById: ClusterMetadataById): Promise<BasicBreakdown[]> {
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
        clusterName: clusterById[cluster.key]?.name || cluster.key,
        clusterId: cluster.key
      };
    });
  });

}

export async function getRancherBreakdown(range: Range, clusterId: string, keywords: string[], clusterById: ClusterMetadataById): Promise<BasicBreakdown[]> {
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
        clusterName: clusterById[cluster.key]?.name || cluster.key,
        clusterId: cluster.key
      };
    });
  });
}

export async function getLonghornBreakdown(range: Range, clusterId: string, keywords: string[], clusterById: ClusterMetadataById): Promise<BasicBreakdown[]> {
  const breakdownPromise = search(getLonghornBreakdownQuery(range, clusterId));
  const keywordsBreakdownPromise = search(getLonghornKeywordsBreakdownQuery(range, clusterId, keywords));
  const clusters = (await breakdownPromise).rawResponse?.aggregations?.cluster_id?.buckets || [];
  const keywordsClusters = (await keywordsBreakdownPromise).rawResponse?.aggregations?.cluster_id?.buckets || [];

  return clusters.flatMap(cluster => {
    const keywordsCluster = keywordsClusters.find(c => c.key === cluster.key) || {};

    const buckets = cluster.pod_name?.buckets || [];
    const keywordsBuckets = keywordsCluster.pod_name?.buckets || [];

    return buckets.map((bucket) => {
      const keywordsBucket = keywordsBuckets.find(b => b.key === bucket.key);
      return {
        ...extractCounts(bucket.anomaly_level?.buckets),
        keywords: keywordsBucket?.doc_count || 0,
        name: bucket.key,
        clusterName: clusterById[cluster.key]?.name || cluster.key,
        clusterId: cluster.key
      };
    });
  });
}

export async function getPodBreakdown(range: Range, clusterId: string, keywords: string[], clusterById: ClusterMetadataById): Promise<BasicBreakdown[]> {
  const breakdownPromise = search(getPodBreakdownQuery(range, clusterId));
  const keywordsBreakdownPromise = search(getPodKeywordsBreakdownQuery(range, clusterId, keywords));
  const response = await breakdownPromise;

  if (response.rawResponse.hits.total === 0) {
    return [];
  }
  const clusters = response.rawResponse?.aggregations?.cluster_id?.buckets || [];
  const keywordsClusters = (await keywordsBreakdownPromise).rawResponse?.aggregations?.cluster_id?.buckets || [];

  return clusters.flatMap(cluster => {
    const keywordsCluster = keywordsClusters.find(c => c.key === cluster.key) || {};

    const buckets = cluster.component_name?.buckets || [];
    const keywordsBuckets = keywordsCluster.component_name?.buckets || [];

    return buckets
      .filter((bucket) => {
        return bucket.anomaly_level.buckets.some(b => b.key === 'Anomaly' || b.key === 'Normal')
      })
      .map((bucket) => {
        const keywordsBucket = keywordsBuckets.find(b => b.key === bucket.key);
        return {
          ...extractCounts(bucket.anomaly_level.buckets),
          keywords: keywordsBucket?.doc_count || 0,
          name: bucket.key,
          clusterName: clusterById[cluster.key]?.name || cluster.key,
          clusterId: cluster.key
        };
      });
  });
}

export async function getDeploymentBreakdown(range: Range, clusterId: string, keywords: string[], clusterById: ClusterMetadataById): Promise<DeploymentBreakdown[]> {
  const breakdownPromise = search(getPodBreakdownQuery(range, clusterId));
  const keywordsBreakdownPromise = search(getPodKeywordsBreakdownQuery(range, clusterId, keywords));
  const response = await breakdownPromise;
  console.log('rrr', response);
  if (response.rawResponse.hits.total === 0) {
    return [];
  }
  const clusters = response.rawResponse?.aggregations?.cluster_id?.buckets || [];
  const keywordsClusters = (await keywordsBreakdownPromise).rawResponse?.aggregations?.cluster_id?.buckets || [];

  return clusters.flatMap(cluster => {
    const keywordsCluster = keywordsClusters.find(c => c.key === cluster.key) || {};

    return cluster.namespace_name.buckets.flatMap(namespaceBucket => {
      return namespaceBucket.deployment.buckets.flatMap(deploymentBucket => {
        const buckets = deploymentBucket.component_name?.buckets || [];
        const keywordsBuckets = keywordsCluster.component_name?.buckets || [];
        return buckets
          .filter((bucket) => {
            return bucket.anomaly_level.buckets.some(b => b.key === 'Anomaly' || b.key === 'Normal')
          })
          .map((bucket) => {
            const keywordsBucket = keywordsBuckets.find(b => b.key === bucket.key);
            return {
              ...extractCounts(bucket.anomaly_level.buckets),
              keywords: keywordsBucket?.doc_count || 0,
              name: bucket.key,
              namespace: namespaceBucket.key,
              deployment: deploymentBucket.key,
              clusterName: clusterById[cluster.key]?.name || cluster.key,
              clusterId: cluster.key
            };
          });
      });
    });
  });
}

export async function getLogTemplates(range: Range, clusterId: string): Promise<LogTemplate[]> {
  const [templateLogCountResponse, templatesResponse] = await Promise.all([search(getLogTemplatesQuery(range, clusterId)), search(getLogTemplateAddonQuery(), 'templates*')]);

  const templateLogCounts = (templateLogCountResponse.rawResponse.aggregations?.templates?.buckets || []).map(bucket => ({
    templateId: bucket.key,
    count: bucket.doc_count,
  }));

  const templateLogCountLookup = {};
  templateLogCounts.forEach(t => {
    templateLogCountLookup[t.templateId] = t;
  });

  const templates = templatesResponse.rawResponse.hits.hits;

  const allData = templates.map(at => {
    const id = at._source.doc.template_cluster_id;
    const found = templateLogCountLookup[id];

    return {
      templateId: id,
      count: found?.count || 0,
      template: at._source.doc.template_matched,
      log: at._source.doc.log
    }
  });

  const dataWithCounts = allData.filter(d => d.count);
  return sortBy(dataWithCounts, 'count').reverse();
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

export async function getNamespaceBreakdown(range: Range, clusterId: string, keywords: string[], clusterById: ClusterMetadataById): Promise<BasicBreakdown[]> {
  const breakdownPromise = search(getNamespaceBreakdownQuery(range, clusterId));
  const keywordsBreakdownPromise = search(getNamespaceKeywordsBreakdownQuery(range, clusterId, keywords));
  const response = await breakdownPromise;
  if (response.rawResponse.hits.total === 0) {
    return [];
  }
  const clusters = response.rawResponse?.aggregations?.cluster_id?.buckets || [];
  const keywordsClusters = (await keywordsBreakdownPromise).rawResponse?.aggregations?.cluster_id?.buckets || [];
  const out = clusters.flatMap(cluster => {
    const keywordsCluster = keywordsClusters.find(c => c.key === cluster.key) || {};

    const buckets = cluster.component_name?.buckets || [];
    const keywordsBuckets = keywordsCluster.component_name?.buckets || [];

    return buckets
      .filter((bucket) => {
        return bucket.anomaly_level.buckets.some(b => b.key === 'Anomaly' || b.key === 'Normal')
      })
      .map((bucket) => {
        const keywordsBucket = keywordsBuckets.find(b => b.key === bucket.key);
        return {
          ...extractCounts(bucket.anomaly_level.buckets),
          keywords: keywordsBucket?.doc_count || 0,
          name: bucket.key,
          clusterName: clusterById[cluster.key]?.name || cluster.key,
          clusterId: cluster.key
        };
      });
  });

  return out;
}

export async function getAnomalies(range: Range, granularity: Granularity, clusterId: string): Promise<AnomalyByComponent> {
  const results = await search(getAnomaliesQuery(range, granularity, clusterId));
  const byComponent: AnomalyByComponent = {};
  const buckets = results.rawResponse?.aggregations?.histogram?.buckets || [];

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

async function search(query, index = 'logs*') {
  return (await Axios.post(
    getSearchUrl(),
    {
      params: {
        index,
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
        "must": [
          ...must(clusterId, logType),
        ]
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
          ...must(clusterId, logType),
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
        "terms": { "field": "cluster_id", "size": 1000 },
        "aggs": {
          "component_name": {
            "terms": { "field": "kubernetes_component", "size": 1000 },
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
        "terms": { "field": "cluster_id", "size": 1000 },
        "aggs": {
          "component_name": {
            "terms": { "field": "kubernetes_component", "size": 1000 },
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
        "terms": { "field": "cluster_id", "size": 1000 },
        "aggs": {
          "pod_name": {
            "terms": { "field": "pod_name.keyword", "size": 1000 },
            "aggs": {
              "anomaly_level": { "terms": { "field": "anomaly_level" } }
            },
          }
        }
      }
    },
  }
}

function getLonghornBreakdownQuery(range: Range, clusterId: string) {
  return {
    "query": {
      "bool": {
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
        "must": [...must(clusterId), { "match": { "log_type": "longhorn" } }],
      }
    },
    "aggs": {
      "cluster_id": {
        "terms": { "field": "cluster_id", "size": 1000 },
        "aggs": {
          "pod_name": {
            "terms": { "field": "pod_name.keyword", "size": 1000 },
            "aggs": {
              "anomaly_level": { "terms": { "field": "anomaly_level" } }
            },
          }
        }
      }
    },
  }
}

function getLogTemplateAddonQuery() {
  return {
    "size": 10000,
  }
}

function getLogTemplatesQuery(range: Range, clusterId: string) {
  return {
    "query": {
      "bool": {
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
        "must": [...must(clusterId)],
      }
    },
    "size": 0,
    "aggs": {
      "templates": {
        "terms": { "field": "template_cluster_id", "size": 30000 },
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
        "terms": { "field": "cluster_id", "size": 1000 },
        "aggs": {
          "pod_name": {
            "terms": { "field": "pod_name.keyword", "size": 1000 },
          }
        }
      }
    },
  }
}

function getLonghornKeywordsBreakdownQuery(range: Range, clusterId: string, keywords: string[]) {
  return {
    "query": {
      "bool": {
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
        "must": [
          ...must(clusterId),
          ...mustKeywords(keywords),
          { "match": { "log_type": "longhorn" } }
        ],
      }
    },
    "size": 0,
    "aggs": {
      "cluster_id": {
        "terms": { "field": "cluster_id", "size": 1000 },
        "aggs": {
          "pod_name": {
            "terms": { "field": "pod_name.keyword", "size": 1000 },
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
        "must": [...must(clusterId), { "regexp": { "namespace_name.keyword": ".+" } }, { "match": { "log_type": "workload" } }],
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
      }
    },
    "aggs": {
      "cluster_id": {
        "terms": { "field": "cluster_id", "size": 1000 },
        "aggs": {
          "component_name": {
            "terms": { "field": "namespace_name.keyword", "size": 1000 },
            "aggs": {
              "anomaly_level": { "terms": { "field": "anomaly_level" } }
            },
          }
        }
      }
    },
  }
}

function getNamespaceKeywordsBreakdownQuery(range: Range, clusterId: string, keywords: string[]) {
  return {
    "query": {
      "bool": {
        "must": [
          ...must(clusterId),
          ...mustKeywords(keywords),
          { "regexp": { "namespace_name.keyword": ".+" } },
          { "match": { "log_type": "workload" } }
        ],
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
      }
    },
    "aggs": {
      "bucket": {
        "composite": {
          "size": 1000,
          "sources": [{ "cluster_id": { "terms": { "field": "cluster_id" } } }, { "namespace_name": { "terms": { "field": "namespace_name.keyword" } } }],
        },
      }
    }
  };
}

function getPodBreakdownQuery(range: Range, clusterId: string) {
  return {
    "size": 0,
    "query": {
      "bool": {
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
        "must": [...must(clusterId), { "regexp": { "pod_name.keyword": ".+" } }, { "match": { "log_type": "workload" } }],
      }
    },
    "aggs": {
      "cluster_id": {
        "terms": { "field": "cluster_id", "size": 1000 },
        "aggs": {
          "namespace_name": {
            "terms": { "field": "namespace_name.keyword", "size": 1000 },
            "aggs": {
              "deployment": {
                "terms": { "field": "deployment.keyword", "size": 1000 },
                "aggs": {
                  "component_name": {
                    "terms": { "field": "pod_name.keyword", "size": 1000 },
                    "aggs": {
                      "anomaly_level": { "terms": { "field": "anomaly_level" } }
                    },
                  }
                }
              }
            }
          }
        }
      }
    },
  };
}

function getPodKeywordsBreakdownQuery(range: Range, clusterId: string, keywords: string[]) {
  return {
    "size": 0,
    "query": {
      "bool": {
        "must": [
          ...must(clusterId),
          ...mustKeywords(keywords),
          { "regexp": { "namespace_name.keyword": ".+" } },
          { "match": { "log_type": "workload" } }
        ],
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
      }
    },
    "aggs": {
      "bucket": {
        "composite": {
          "size": 1000,
          "sources": [{ "cluster_id": { "terms": { "field": "cluster_id" } } }, { "namespace_name": { "terms": { "field": "namespace_name.keyword" } } }, { "pod_name": { "terms": { "field": "pod_name.keyword" } } }],
        },
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

function getClusterQuery(range: Range) {
  return {
    "query": {
      "bool": {
        "filter": [{ "range": { "time": { "gte": range.start, "lte": range.end } } }],
      }
    },
    "aggs": {
      "clusters": {
        "terms": { "field": "cluster_id", "size": 1000 },
        "aggs": {
          "anomaly_level": { "terms": { "field": "anomaly_level" } }
        },
      }
    },
  }
}
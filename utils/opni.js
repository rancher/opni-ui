import { base64Encode } from '@/utils/crypto';
import axios from 'axios';

export async function elasticRequest(query, fallback) {
  if (!location.search.includes('real')) {
    return fallback;
  }

  const headers = {
    Authorization: `Basic ${ base64Encode(`admin:admin`) }`,
    'kbn-xsrf':    'reporting'
  };

  const response = await axios.post('/internal/search/es', query, { headers });

  return response.data;
}

export async function getInsights(from, to) {
  /* eslint-disable */
  const insightsQuery = {"params":{"index":"logs*","body":{"aggs":{"2":{"date_histogram":{"field":"timestamp","fixed_interval":"30s","time_zone":"America/Phoenix","min_doc_count":1},"aggs":{"3":{"terms":{"field":"anomaly_level.keyword","order":{"_count":"desc"},"size":5}}}}},"size":0,"stored_fields":["*"],"script_fields":{},"docvalue_fields":[{"field":"time","format":"date_time"},{"field":"timestamp","format":"date_time"}],"_source":{"excludes":[]},"query":{"bool":{"must":[],"filter":[{"match_all":{}},{"range":{"timestamp":{"gte":from,"lte":to,"format":"strict_date_optional_time"}}}],"should":[],"must_not":[]}}},"preference":1626993045882}};
  /* eslint-enable */
  const response = await elasticRequest(insightsQuery, require('./opni-data/insights.json'));

  if (response.rawResponse.hits.total === 0) {
    return [];
  }

  return response.rawResponse.aggregations[2].buckets.map((bucket) => {
    const data = {};

    bucket[3].buckets.forEach((subBucket) => {
      data[subBucket.key] = subBucket.doc_count;
    });

    return {
      timestamp:  bucket.key,
      normal:     data.Normal || 0,
      suspicious: data.Suspicious || 0,
      anomaly:    data.Anomaly || 0
    };
  });
}

export function getPointsOfInterest() {
  return Promise.resolve(require('./opni-data/points-of-interest.json'));
}

export async function getAnomalies(from, to) {
  /* eslint-disable */
  const anomalyQuery = {"params":{"index":"logs*","body":{"aggs":{"2":{"date_histogram":{"field":"timestamp","fixed_interval":"30s","time_zone":"America/Phoenix","min_doc_count":1},"aggs":{"4":{"filters":{"filters":{"Control Plane Anomaly":{"bool":{"must":[{"query_string":{"query":"is_control_plane_log:true","analyze_wildcard":true,"time_zone":"America/Phoenix"}}],"filter":[],"should":[],"must_not":[]}},"Workload Anomaly":{"bool":{"must":[{"query_string":{"query":"is_control_plane_log:false","analyze_wildcard":true,"time_zone":"America/Phoenix"}}],"filter":[],"should":[],"must_not":[]}}}},"aggs":{"3":{"filters":{"filters":{" ":{"bool":{"must":[{"query_string":{"query":"anomaly_level:Anomaly","analyze_wildcard":true,"time_zone":"America/Phoenix"}}],"filter":[],"should":[],"must_not":[]}}}}}}}}}},"size":0,"stored_fields":["*"],"script_fields":{},"docvalue_fields":[{"field":"time","format":"date_time"},{"field":"timestamp","format":"date_time"}],"_source":{"excludes":[]},"query":{"bool":{"must":[],"filter":[{"match_all":{}},{"range":{"timestamp":{"gte":from, "lte":to, "format":"strict_date_optional_time"}}}],"should":[],"must_not":[]}}},"preference":1626993045882}}
  /* eslint-enable */
  const response = await elasticRequest(anomalyQuery, require('./opni-data/anomoly.json'));

  if (response.rawResponse.hits.total === 0) {
    return [];
  }

  return response.rawResponse.aggregations[2].buckets.map((bucket) => {
    const data = {};

    Object.entries(bucket[4].buckets).forEach(([key, value]) => {
      data[key] = value;
    });

    return {
      timestamp:           bucket.key,
      // controlPlaneAnomaly: data['Control Plane Anomaly'].doc_count || 0,
      // workloadAnomaly:     data['Workload Anomaly'].doc_count || 0,
      controlPlaneAnomaly: data['Control Plane Anomaly'][3]?.buckets[' ']['doc_count'] || 0,
      workloadAnomaly:     data['Workload Anomaly'][3]?.buckets[' ']['doc_count'] || 0,
    };
  });
}

export async function getLogs(from, to) {
  /* eslint-disable */
  const logsQuery = {"params":{"index":"logs*","body":{"version":true,"size":500,"sort":[{"timestamp":{"order":"desc","unmapped_type":"boolean"}}],"stored_fields":["*"],"script_fields":{},"docvalue_fields":[{"field":"time","format":"date_time"},{"field":"timestamp","format":"date_time"}],"_source":{"excludes":[]},"query":{"bool":{"must":[],"filter":[{"match_all":{}},{"match_all":{}},{"match_phrase":{"is_control_plane_log":true}},{"match_phrase":{"nulog_anomaly":true}},{"range":{"timestamp":{"gte":from,"lte":to,"format":"strict_date_optional_time"}}}],"should":[],"must_not":[{"match_phrase":{"anomaly_level":"Normal"}}]}},"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}},"fragment_size":2147483647}},"preference":1626993045882}}
  /* eslint-enable */

  const response = await elasticRequest(logsQuery, require('./opni-data/logs.json'));

  if (response.rawResponse.hits.total === 0) {
    return [];
  }

  return response.rawResponse.hits.hits.map((hit) => {
    return {
      timestamp:  hit._source.timestamp,
      message:   hit._source.message,
      level:     hit._source.anomaly_level,
      component: hit._source.kubernetes_component
    };
  });
}

export async function getWorkloadLogs(from, to) {
  /* eslint-disable */
  const workloadLogsQuery = {"params":{"index":"logs*","body":{"version":true,"size":500,"sort":[{"timestamp":{"order":"desc","unmapped_type":"boolean"}}],"stored_fields":["*"],"script_fields":{},"docvalue_fields":[{"field":"time","format":"date_time"},{"field":"timestamp","format":"date_time"}],"_source":{"excludes":[]},"query":{"bool":{"must":[{"match_all":{}}],"filter":[{"match_all":{}},{"match_phrase":{"is_control_plane_log":false}},{"match_phrase":{"nulog_anomaly":true}},{"range":{"timestamp":{"gte":from,"lte":to,"format":"strict_date_optional_time"}}}],"should":[],"must_not":[{"match_phrase":{"anomaly_level":"Normal"}}]}},"highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}},"fragment_size":2147483647}},"preference":1626993045882}};
  /* eslint-enable */

  const response = await elasticRequest(workloadLogsQuery, require('./opni-data/workload-logs.json'));

  if (response.rawResponse.hits.total === 0) {
    return [];
  }

  return response.rawResponse.hits.hits.map((hit) => {
    return {
      timestamp:  hit._source.timestamp,
      message:   hit._source.message,
      level:     hit._source.anomaly_level,
      component: hit._source.kubernetes_component
    };
  });
}

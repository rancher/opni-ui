import axios from 'axios';

const POINTS = 24;
const MS_IN_HOUR = 3600000;

export async function getPointsOfInterest(from) {
  const points = await Promise.resolve(require('./opni-data/points-of-interest.json'));

  points[0].fromTo = {
    from: from + (20 * MS_IN_HOUR),
    to:   from + (21 * MS_IN_HOUR)
  };

  return points;
}

export async function getPodBreakdown(from, to) {
  return (await axios.get(`opni-api/pod?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data?.Pods;
}

export async function getNamespaceBreakdown(from, to) {
  return (await axios.get(`opni-api/namespace?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data?.Namespaces;
}

export async function getWorkloadBreakdown(from, to) {
  return (await axios.get(`opni-api/workload?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`)).data;
}

export async function getOverallBreakdownSeries(from, to) {
  const promises = [...Array(POINTS)].map((_, i) => getOverallBreakdown(from.add(i, 'hours'), from.add(i + 1, 'hours')));
  const responses = (await Promise.all(promises)).map(p => p.data);

  return responses.map((r, i) => ({
    timestamp:  from.add(i, 'hours').valueOf(),
    normal:     r.Normal || 0,
    suspicious: r.Suspicious || 0,
    anomaly:    r.Anomaly || 0
  }));
}

export async function getOverallBreakdown(from, to) {
  return (await axios.get(`opni-api/overall_insights?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`));
}

export async function getLogs(from, to) {
  const logs = (await axios.get(`opni-api/logs?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`)).data.Logs;

  return logs.map((log) => {
    return {
      timestamp:      log.timestamp,
      message:        log.log,
      level:          log.anomaly_level,
      namespace:      log.kubernetes?.namespace_name,
      podName:        log.kubernetes?.pod_name,
      isControlPlane: log.is_control_plane_log,
    };
  });
}

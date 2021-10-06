import axios from 'axios';
import { Dayjs } from 'dayjs';

const POINTS = 24;
const MS_IN_HOUR = 3600000;

/* eslint-disable camelcase */
interface LogResponse {
  timestamp: Number,
  log: String,
  anomaly_level: String,
  'kubernetes.namespace_name': String;
  'kubernetes.pod_name': String
  is_control_plane_log: Boolean,
}

interface LogsResponse {
  Logs: LogResponse[];
}

interface Log {
  timestamp: Number;
  message: String;
  level: String;
  namespace?: String;
  podName?: String;
  isControlPlane: Boolean;
}

interface FromTo {
    from: Number,
    to: Number
}

type Level = 'Anomaly' | 'Suspicious';

interface PointsOfInterestResponse {
    fromTo: FromTo;
    levels: Level[];
    components: String[];
    workloadCount: Number;
    controlPlaneCount: Number;
    count: Number;
    highlightGraphIndex: Number
}

interface Insights {
  Anomaly: Number;
  Normal: Number;
  Suspicious: Number;
}
interface Breakdown {
  Insights: Insights;
  Name: String;
}

interface WorkloadBreakdown extends Breakdown {
  Namespace: String;
}
interface WorkloadBreakdownAggregation {
  CustomResource: WorkloadBreakdown[];
  DaemonSet: WorkloadBreakdown[];
  Deployment: WorkloadBreakdown[];
  Independent: WorkloadBreakdown[];
  Job: WorkloadBreakdown[];
  ReplicaSet: WorkloadBreakdown[];
  StatefulSet: WorkloadBreakdown[];
}

interface BreakdownsResponse {
  Namespaces: Breakdown[];
  Pods: Breakdown[];
  Workloads: WorkloadBreakdownAggregation;
}

/* eslint-enable camelcase */

export async function getPointsOfInterest(from: Dayjs):Promise<PointsOfInterestResponse[]> {
  const points = await Promise.resolve<PointsOfInterestResponse[]>(require('./mock-data/points-of-interest.json'));

  points[0].fromTo = {
    from: from.valueOf() + (2 * MS_IN_HOUR),
    to:   from.valueOf() + (3 * MS_IN_HOUR)
  };

  return points;
}

export async function getBreakdowns(from: Dayjs, to: Dayjs): Promise<BreakdownsResponse> {
  return (await axios.get<BreakdownsResponse>(`opni-api/insights_breakdown?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data;
}

export async function getOverallBreakdownSeries(from: Dayjs, to: Dayjs) {
  const promises = [...Array(POINTS)].map((_, i) => getOverallBreakdown(from.add(i, 'hour'), from.add(i + 1, 'hour')));
  const responses = (await Promise.all(promises)).map(p => p.data);

  return responses.map((r, i) => ({
    timestamp:  from.add(i, 'hour').valueOf(),
    normal:     r.Normal || 0,
    suspicious: r.Suspicious || 0,
    anomaly:    r.Anomaly || 0
  }));
}

export async function getOverallBreakdown(from: Dayjs, to: Dayjs) {
  return (await axios.get(`opni-api/overall_insights?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`));
}

export async function getLogs(from: Dayjs, to: Dayjs): Promise<Log[]> {
  const logs = (await axios.get<LogsResponse>(`opni-api/logs?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`)).data.Logs;

  return logs.map((log: LogResponse) => {
    return {
      timestamp:      log.timestamp,
      message:        log.log,
      level:          log.anomaly_level,
      namespace:      log['kubernetes.namespace_name'],
      podName:        log['kubernetes.pod_name'],
      isControlPlane: log.is_control_plane_log,
    };
  });
}

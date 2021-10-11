import axios from 'axios';
import dayjs, { Dayjs, UnitType } from 'dayjs';

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

interface AreaOfInterestResponse {
  start_ts: number;
  end_ts: number;
}

/* eslint-enable camelcase */

export async function getAreasOfInterest(from: Dayjs, to: Dayjs): Promise<FromTo[]> {
  const response = (await axios.get<AreaOfInterestResponse[]>(`opni-api/areas_of_interest?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data;

  return (response)
    .filter(r => r.start_ts > 0 && r.end_ts > 0)
    .map(r => ({
      from: r.start_ts,
      to:   r.end_ts
    }));
}

export async function getBreakdowns(from: Dayjs, to: Dayjs): Promise<BreakdownsResponse> {
  return (await axios.get<BreakdownsResponse>(`opni-api/insights_breakdown?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data;
}

export async function getOverallBreakdownSeries(resolution: { unit: UnitType, count: number } ) {
  const now = dayjs();
  const yesterday = now.subtract(1, 'day');
  const points = Math.floor(now.diff(yesterday, resolution.unit) / resolution.count);

  const promises = [...Array(points)].map((_, i) => getOverallBreakdown(yesterday.add(i * resolution.count, resolution.unit), yesterday.add((i + 1) * resolution.count, resolution.unit)));
  const responses = (await Promise.all(promises)).map(p => p.data);

  return responses.map((r, i) => ({
    timestamp:  yesterday.add(i * resolution.count, resolution.unit).valueOf(),
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

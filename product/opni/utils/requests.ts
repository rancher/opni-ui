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

interface BreakdownNested {
  Insights: {
    Insights: Insights
  };
  Name: String;
}

interface Breakdown {
  Insights: Insights;
  Name: String;
}

interface WorkloadBreakdown extends Breakdown {
  Namespace: String;
}

interface WorkloadBreakdownNested extends BreakdownNested {
  Namespace: String;
}

interface PodBreakdownResponse {
  Pods: BreakdownNested[];
}

interface NamespaceBreakdownReponse {
  Namespaces: BreakdownNested[];
}

interface WorkloadBreakdownNestedResponse {
  CustomResource: WorkloadBreakdownNested[];
  DaemonSet: WorkloadBreakdownNested[];
  Deployment: WorkloadBreakdownNested[];
  Independent: WorkloadBreakdownNested[];
  Job: WorkloadBreakdownNested[];
  ReplicaSet: WorkloadBreakdownNested[];
  StatefulSet: WorkloadBreakdownNested[];
}

interface WorkloadBreakdownResponse {
  CustomResource: WorkloadBreakdown[];
  DaemonSet: WorkloadBreakdown[];
  Deployment: WorkloadBreakdown[];
  Independent: WorkloadBreakdown[];
  Job: WorkloadBreakdown[];
  ReplicaSet: WorkloadBreakdown[];
  StatefulSet: WorkloadBreakdown[];
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

export async function getPodBreakdown(from: Dayjs, to: Dayjs): Promise<Breakdown[]> {
  const response = (await axios.get<PodBreakdownResponse>(`opni-api/pod?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data?.Pods;

  return deNest<Breakdown>(response);
}

export async function getNamespaceBreakdown(from: Dayjs, to: Dayjs): Promise<Breakdown[]> {
  const response = (await axios.get<NamespaceBreakdownReponse>(`opni-api/namespace?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data?.Namespaces;

  return deNest<Breakdown>(response);
}

export async function getWorkloadBreakdown(from: Dayjs, to: Dayjs): Promise<WorkloadBreakdownResponse> {
  const response = (await axios.get<WorkloadBreakdownNestedResponse>(`opni-api/workload?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`)).data;

  return {
    CustomResource: deNest<WorkloadBreakdown>(Array.isArray(response.CustomResource) ? response.CustomResource : []),
    DaemonSet:      deNest<WorkloadBreakdown>(Array.isArray(response.DaemonSet) ? response.DaemonSet : []),
    Deployment:     deNest<WorkloadBreakdown>(Array.isArray(response.Deployment) ? response.Deployment : []),
    Independent:    deNest<WorkloadBreakdown>(Array.isArray(response.Independent) ? response.Independent : []),
    Job:            deNest<WorkloadBreakdown>(Array.isArray(response.Job) ? response.Job : []),
    ReplicaSet:     deNest<WorkloadBreakdown>(Array.isArray(response.ReplicaSet) ? response.ReplicaSet : []),
    StatefulSet:    deNest<WorkloadBreakdown>(Array.isArray(response.StatefulSet) ? response.StatefulSet : []),
  };
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

function deNest<T>(nested: BreakdownNested[]):T[] {
  return nested.map(row => ({
    ...row,
    Insights: row.Insights.Insights
  })) as any as T[];
}

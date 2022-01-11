import axios from 'axios';
import day, { Dayjs, UnitType } from 'dayjs';
import { AreaOfInterestResponse } from '@/product/opni/models/areasOfInterest';
import { FromTo } from '@/product/opni/models/fromTo';
import { Breakdowns, BreakdownsResponse } from '~/product/opni/models/overallBreakdown/Breakdowns';
import { Log } from '~/product/opni/models/log/Log';
import { Logs, LogsResponse } from '~/product/opni/models/log/Logs';
interface UnitCount {
  unit: UnitType,
  count: number
}

type Granularity = UnitCount;

type LogLevel = 'Normal' | 'Anomalous' | 'Suspicious';

export async function getAreasOfInterest(now: Dayjs, range: UnitCount, granularity: Granularity): Promise<FromTo[]> {
  const from = getStartTime(now, range, granularity);
  const to = now;
  const response = (await axios.get<AreaOfInterestResponse[]>(`opni-api/areas_of_interest?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data || [];

  return (response)
    .filter(r => r.start_ts > 0 && r.end_ts > 0)
    .map(r => new FromTo(r.start_ts, r.end_ts));
}

export async function getBreakdowns(from: Dayjs, to: Dayjs): Promise<Breakdowns> {
  const response = (await axios.get<BreakdownsResponse>(`opni-api/insights_breakdown?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data;

  return new Breakdowns(response);
}

export async function getOverallBreakdownSeries(now: Dayjs, range: UnitCount, granularity: Granularity) {
  const from = getStartTime(now, range, granularity);
  const to = now;
  const response = (await axios.get(`opni-api/overall_insights?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }&granularity_level=${ granularity.count }${ granularity.unit }`));

  response.data.from = from;
  response.data.to = to;

  const mapped = response.data.Insights.map((r: any) => ({
    timestamp:  day(r.time_start).add(granularity.count, granularity.unit).valueOf(),
    normal:     r.Normal || 0,
    suspicious: r.Suspicious || 0,
    anomaly:    r.Anomaly || 0
  }));

  if (mapped.length > 0) {
    mapped[mapped.length - 1].timestamp = now.valueOf();
  }

  return mapped;
}

export function getStartTime(now: Dayjs, range: UnitCount, granularity: Granularity) {
  const firstAlignedPoint = getFirstAlignedPoint(now, granularity);

  return firstAlignedPoint.subtract(range.count, range.unit);
}

export function getFirstAlignedPoint(now: Dayjs, granularity: Granularity ) {
  const remainder = now.get(granularity.unit) % granularity.count;
  const first = granularity.count > 1 ? now.subtract(remainder, granularity.unit) : now;

  return first.startOf(granularity.unit);
}

export async function getOverallBreakdown(from: Dayjs, to: Dayjs) {
  const response = (await axios.get(`opni-api/overall_insights?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }&granularity_level=junk`));

  response.data.from = from;
  response.data.to = to;

  return response.data;
}

export async function getLogs(from: Dayjs, to: Dayjs, filter: Object): Promise<Log[]> {
  const filterString = Object.entries(filter)
    .map(([key, value]) => `${ key }=${ value }`)
    .join('&');
  const logs = (await axios.get<LogsResponse>(`opni-api/logs?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }&${ filterString }`)).data.Logs;
  // const logs = await require('./logs.json').Logs;

  return logs.map(l => new Log(l) );
}

function query(params: Object) {
  return Object.entries(params)
    .filter(([, value]) => value)
    .map(([key, value]) => `${ key }=${ value }`)
    .join('&');
}

export async function getPodLogs(from: Dayjs, to: Dayjs, logLevel: LogLevel, name: String, namespaceName: String, scrollId?: String):Promise<Logs> {
  const params = {
    start_ts:       from.valueOf(),
    end_ts:         to.valueOf(),
    anomaly_level:  logLevel,
    scroll_id:      scrollId,
    pod_name:       name,
    namespace_name: namespaceName
  };
  const logs = (await axios.get<LogsResponse>(`opni-api/logs_pod?${ query(params) }`)).data;

  return new Logs(logs);
}

export async function getNamespaceLogs(from: Dayjs, to: Dayjs, logLevel: LogLevel, name: String, scrollId: String) {
  const params = {
    start_ts:       from.valueOf(),
    end_ts:         to.valueOf(),
    anomaly_level:  logLevel,
    scroll_id:      scrollId,
    namespace_name: name
  };
  const logs = (await axios.get<LogsResponse>(`opni-api/logs_namespace?${ query(params) }`)).data;

  return new Logs(logs);
}

export async function getWorkloadLogs(from: Dayjs, to: Dayjs, logLevel: LogLevel, name: String, namespaceName: String, workloadType: String, scrollId: String) {
  const params = {
    start_ts:       from.valueOf(),
    end_ts:         to.valueOf(),
    anomaly_level:  logLevel,
    scroll_id:      scrollId,
    namespace_name: namespaceName,
    workload_type:  workloadType,
    workload_name:  name
  };
  const logs = (await axios.get<LogsResponse>(`opni-api/logs_workload?${ query(params) }`)).data;

  return new Logs(logs);
}

export async function getControlPlaneLogs(from: Dayjs, to: Dayjs, logLevel: LogLevel, name: String, scrollId: String) {
  const params = {
    start_ts:                from.valueOf(),
    end_ts:                  to.valueOf(),
    anomaly_level:           logLevel,
    scroll_id:               scrollId,
    control_plane_component: name
  };
  const logs = (await axios.get<LogsResponse>(`opni-api/logs_control_plane?${ query(params) }`)).data;

  return new Logs(logs);
}

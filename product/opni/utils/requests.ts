import axios from 'axios';
import { Dayjs, UnitType } from 'dayjs';
import { AreaOfInterestResponse } from '@/product/opni/models/areasOfInterest';
import { FromTo } from '@/product/opni/models/fromTo';
import { Breakdowns, BreakdownsResponse } from '~/product/opni/models/overallBreakdown/Breakdowns';
import { Log } from '~/product/opni/models/log/Log';
import { LogsResponse } from '~/product/opni/models/log/Logs';
interface UnitCount {
  unit: UnitType,
  count: number
}

type Granularity = UnitCount;

export async function getAreasOfInterest(now: Dayjs, range: UnitCount, granularity: Granularity): Promise<FromTo[]> {
  const fromTos = getFromTos(now, range, granularity);
  const from = fromTos[0].from;
  const to = now;
  const response = (await axios.get<AreaOfInterestResponse[]>(`opni-api/areas_of_interest?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data;

  return (response)
    .filter(r => r.start_ts > 0 && r.end_ts > 0)
    .map(r => new FromTo(r.start_ts, r.end_ts));
}

export async function getBreakdowns(from: Dayjs, to: Dayjs): Promise<Breakdowns> {
  const response = (await axios.get<BreakdownsResponse>(`opni-api/insights_breakdown?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }`))?.data;

  return new Breakdowns(response);
}

export async function getOverallBreakdownSeries(now: Dayjs, range: UnitCount, granularity: Granularity ) {
  const fromTos = getFromTos(now, range, granularity);

  const promises = fromTos.map(({ from, to }) => getOverallBreakdown(from, to));
  const responses = await Promise.all(promises);

  return responses.map(r => ({
    timestamp:  r.to.valueOf(),
    normal:     r.Normal || 0,
    suspicious: r.Suspicious || 0,
    anomaly:    r.Anomaly || 0
  }));
}

function getFirstAlignedPoint(now: Dayjs, granularity: Granularity ) {
  const remainder = now.get(granularity.unit) % granularity.count;
  const first = granularity.count > 1 ? now.subtract(remainder, granularity.unit) : now;

  return first.startOf(granularity.unit);
}

const UNIT_MS_COUNT = {
  milliseconds: 1,
  seconds:      1000,
  minutes:      60000,
  hours:        3600000,
  days:         86400000,
  months:       2592000000,
  years:        31536000000,
};

export function getFromTos(now: Dayjs, range: UnitCount, granularity: Granularity) {
  const firstAligned = getFirstAlignedPoint(now, granularity);
  const numberOfPoints = getNumberOfPoints(range, granularity);

  const alignedFromTos = [...Array(numberOfPoints)].map((_, i) => ({
    from: firstAligned.subtract((i + 1) * granularity.count, granularity.unit),
    to:   firstAligned.subtract(i * granularity.count, granularity.unit)
  }));

  return [{ from: firstAligned, to: now }, ...alignedFromTos].reverse();
}

export function getNumberOfPoints(range: UnitCount, granularity: Granularity) {
  const rangeMs = (UNIT_MS_COUNT as any)[range.unit] * range.count;
  const granularityMs = (UNIT_MS_COUNT as any)[granularity.unit] * granularity.count;

  return Math.ceil(rangeMs / granularityMs);
}

export async function getOverallBreakdown(from: Dayjs, to: Dayjs) {
  const response = (await axios.get(`opni-api/overall_insights?start_ts=${ from.valueOf() }&end_ts=${ to.valueOf() }&granularity=junk`));

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

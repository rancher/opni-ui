import moment from 'moment';

export type Granularity = '1h' | '30m' | '10m';

export interface Range {
    start: moment.Moment;
    end: moment.Moment;
}

export function isSameRange(a: Range, b: Range) {
    return a.start.isSame(b.start) && a.end.isSame(b.end) ;
}

export function roundTime(date: moment.Moment, duration: moment.Duration, method: 'ceil' | 'floor' = 'ceil') {
    const durationMs = 1800000;
    const ms = Math[method]((date.valueOf()) / durationMs) * durationMs;
    return moment(ms); 
}
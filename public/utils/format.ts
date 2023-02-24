import moment from 'moment';

const formatter = Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1, roundingIncrement: 1 } as any);

export function formatShort(n: number) {
    return formatter.format(n);
}

export function formatChartTimeLabel(ms) {
    return moment(ms).format('MM/DD/YY - HH:mm');
}
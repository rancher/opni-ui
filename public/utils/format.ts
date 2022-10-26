const formatter = Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1, roundingIncrement: 1 });

export function formatShort(n: number) {
    return formatter.format(n);
}
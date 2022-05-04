export function formatShort(n: number) {
    const k = n > 0 ? Math.floor((Math.log2(n)/10)) : 0;
    const rank = (k > 0 ? 'KMGT'[k - 1] : '');
    const count = n / Math.pow(2, k * 10);
    return +count.toFixed(1) + rank;
}
export function formatCount(number: number): string {
    if (number >= 1_000_000) {
        return (number / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    return number >= 1000
        ? (number / 1000).toFixed(1).replace(/\.0$/, '') + 'K'
        : number.toString();
}

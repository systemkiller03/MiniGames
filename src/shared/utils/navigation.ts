export function getNavigationUrl(path: string): string {
    return path === '/'
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}?route=${encodeURIComponent(path)}`;
}

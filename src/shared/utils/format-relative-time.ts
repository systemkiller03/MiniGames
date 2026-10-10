export function formatRelativeTime(isoDate: string): string {
    const diffMs = Date.now() - new Date(isoDate).getTime();

    if (!Number.isFinite(diffMs) || diffMs <= 0) {
        return 'just now';
    }

    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) {
        return 'just now';
    }
    if (minutes < 60) {
        return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
        return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `${months} month${months === 1 ? '' : 's'} ago`;
    }

    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
}

import { afterEach, describe, expect, it, vi } from 'vitest';

import { formatRelativeTime } from './format-relative-time';

afterEach(() => {
    vi.useRealTimers();
});

describe('formatRelativeTime', () => {
    it('returns just now for future dates, invalid dates, and times under a minute', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

        expect(formatRelativeTime('not a date')).toBe('just now');
        expect(formatRelativeTime('2026-01-01T00:00:01.000Z')).toBe('just now');
        expect(formatRelativeTime('2025-12-31T23:59:30.000Z')).toBe('just now');
    });

    it('uses singular and plural units at minute, hour, day, week, month, and year thresholds', () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

        expect(formatRelativeTime('2025-12-31T23:59:00.000Z')).toBe('1 min ago');
        expect(formatRelativeTime('2025-12-31T23:00:00.000Z')).toBe('1 hour ago');
        expect(formatRelativeTime('2025-12-31T00:00:00.000Z')).toBe('1 day ago');
        expect(formatRelativeTime('2025-12-25T00:00:00.000Z')).toBe('1 week ago');
        expect(formatRelativeTime('2025-11-30T00:00:00.000Z')).toBe('1 month ago');
        expect(formatRelativeTime('2025-01-01T00:00:00.000Z')).toBe('1 year ago');
        expect(formatRelativeTime('2025-12-31T22:00:00.000Z')).toBe('2 hours ago');
        expect(formatRelativeTime('2025-12-29T00:00:00.000Z')).toBe('3 days ago');
    });
});

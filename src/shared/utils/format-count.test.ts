import { describe, expect, it } from 'vitest';

import { formatCount } from './format-count';

describe('formatCount', () => {
    it('formats values below one thousand without adding a suffix', () => {
        expect(formatCount(0)).toBe('0');
        expect(formatCount(999)).toBe('999');
        expect(formatCount(-3)).toBe('-3');
    });

    it('uses compact K and M suffixes with one decimal only when needed', () => {
        expect(formatCount(1000)).toBe('1K');
        expect(formatCount(1250)).toBe('1.3K');
        expect(formatCount(999_999)).toBe('1000K');
        expect(formatCount(1_000_000)).toBe('1M');
        expect(formatCount(2_500_000)).toBe('2.5M');
    });
});

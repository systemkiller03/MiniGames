import { describe, expect, it, vi } from 'vitest';

import { createCategories } from './categories';

describe('createCategories', () => {
    it('marks the active category and reports the selected category slug', () => {
        const onSelect = vi.fn();
        const list = createCategories(
            [
                { slug: 'all', label: 'All games', isDefault: true },
                { slug: 'puzzle', label: 'Puzzles', isDefault: false },
            ],
            'puzzle',
            onSelect,
        );
        const chips = list.querySelectorAll('button');

        expect(chips).toHaveLength(2);
        expect(chips[0]?.getAttribute('aria-pressed')).toBe('false');
        expect(chips[1]?.getAttribute('aria-pressed')).toBe('true');
        chips[0]?.click();
        expect(onSelect).toHaveBeenCalledWith('all');
    });
});

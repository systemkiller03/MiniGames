import { describe, expect, it, vi } from 'vitest';

import { createFilterChip } from './filter-chip';

describe('createFilterChip', () => {
    it('reflects selected state and invokes its selection callback', () => {
        const onClick = vi.fn();
        const chip = createFilterChip({ children: 'Puzzle', selected: true, onClick });

        expect(chip.textContent).toBe('Puzzle');
        expect(chip.getAttribute('aria-pressed')).toBe('true');
        chip.click();
        expect(onClick).toHaveBeenCalledOnce();
    });

    it('appends node content and prevents disabled selection', () => {
        const child = document.createElement('span');
        child.textContent = 'Action';
        const onClick = vi.fn();
        const chip = createFilterChip({ children: child, disabled: true, onClick });

        expect(chip.firstElementChild).toBe(child);
        expect(chip.getAttribute('aria-pressed')).toBe('false');
        expect(chip.disabled).toBe(true);
        chip.click();
        expect(onClick).not.toHaveBeenCalled();
    });
});

import { describe, expect, it, vi } from 'vitest';

import { createSortDropdown } from './sort-dropdown';

describe('createSortDropdown', () => {
    it('opens the listbox, selects an option, and returns the selected value', () => {
        const onSort = vi.fn();
        const dropdown = createSortDropdown(onSort);
        document.body.append(dropdown);
        const trigger = dropdown.querySelector<HTMLButtonElement>('button');
        const menu = dropdown.querySelector<HTMLElement>('[role="listbox"]');

        expect(menu?.hidden).toBe(true);
        trigger?.click();
        expect(menu?.hidden).toBe(false);
        expect(trigger?.getAttribute('aria-expanded')).toBe('true');
        const option = dropdown.querySelector<HTMLElement>('[data-sort-key="name-asc"]');
        option?.click();
        expect(onSort).toHaveBeenCalledWith('name-asc');
        expect(menu?.hidden).toBe(true);
        expect(trigger?.getAttribute('aria-expanded')).toBe('false');
        expect(option?.getAttribute('aria-selected')).toBe('true');
        expect(trigger?.textContent).toContain('Name A–Z');
    });

    it('supports keyboard navigation, selection, escape, and closing outside the control', () => {
        const onSort = vi.fn();
        const dropdown = createSortDropdown(onSort);
        document.body.append(dropdown);
        const trigger = dropdown.querySelector<HTMLButtonElement>('button');
        const options = dropdown.querySelectorAll<HTMLElement>('[role="option"]');

        trigger?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        expect(document.activeElement).toBe(options[0]);
        options[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
        expect(document.activeElement).toBe(options[3]);
        options[3]?.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
        );
        expect(document.activeElement).toBe(options[0]);
        options[0]?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(onSort).toHaveBeenCalledWith('rating-desc');

        trigger?.click();
        trigger?.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
        );
        expect(dropdown.querySelector<HTMLElement>(':scope [role="listbox"]')?.hidden).toBe(true);
        trigger?.click();
        document.dispatchEvent(new Event('pointerdown'));
        expect(dropdown.querySelector<HTMLElement>(':scope [role="listbox"]')?.hidden).toBe(true);
    });
});

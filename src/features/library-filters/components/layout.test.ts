import { describe, expect, it, vi } from 'vitest';

import { createLibraryFiltersLayout } from './layout';

describe('createLibraryFiltersLayout', () => {
    it('updates category loading, error, and selected states and wires both callbacks', () => {
        const onSort = vi.fn();
        const onCategory = vi.fn();
        const retry = vi.fn();
        const filters = createLibraryFiltersLayout();
        filters.setHandlers(onSort, onCategory);

        filters.setLoading();
        expect(filters.categories.dataset.state).toBe('loading');
        expect(filters.categories.textContent).toContain('Loading categories');
        filters.setError(retry);
        expect(filters.categories.dataset.state).toBe('error');
        filters.categories.querySelector('button')?.click();
        expect(retry).toHaveBeenCalledOnce();

        filters.setCategories(
            [
                { slug: 'all', label: 'All', isDefault: true },
                { slug: 'puzzle', label: 'Puzzle', isDefault: false },
            ],
            'puzzle',
        );
        expect(filters.categories.dataset.state).toBe('ready');
        const categoryButton = [...filters.categories.querySelectorAll('button')][0];
        categoryButton?.click();
        expect(onCategory).toHaveBeenCalledWith('all');

        filters.element.querySelector<HTMLButtonElement>('.sort-dropdown__trigger')?.click();
        filters.element.querySelector<HTMLElement>('[data-sort-key="name-desc"]')?.click();
        expect(onSort).toHaveBeenCalledWith('name-desc');
    });
});

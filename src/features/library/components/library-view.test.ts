import { afterEach, describe, expect, it, vi } from 'vitest';

import { createLibraryFiltersLayout } from '@/features/library-filters/components/layout';
import { createLibraryGameGridLayout } from '@/features/library-game-grid/components/layout';
import { createLibraryPaginationLayout } from '@/features/library-pagination/components/layout';
import { createLibraryLayout } from './library-view';

afterEach(() => {
    document.body.replaceChildren();
});

describe('createLibraryLayout', () => {
    it('connects category, sort, and page controls to the supplied callbacks', () => {
        const sort = vi.fn();
        const category = vi.fn();
        const page = vi.fn();
        const filters = createLibraryFiltersLayout();
        const grid = createLibraryGameGridLayout();
        const pagination = createLibraryPaginationLayout();
        const layout = createLibraryLayout(filters, grid, pagination, sort, category, page);
        document.body.append(layout.element);

        filters.setCategories([{ slug: 'all', label: 'All', isDefault: true }], 'all');
        filters.categories.querySelector('button')?.click();
        filters.element.querySelector<HTMLButtonElement>('.sort-dropdown__trigger')?.click();
        filters.element
            .querySelector('[data-sort-key="name-asc"]')
            ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        pagination.update(3, 1);
        pagination.element.querySelector<HTMLButtonElement>('[data-kind="next"]')?.click();

        expect(category).toHaveBeenCalledWith('all');
        expect(sort).toHaveBeenCalledWith('name-asc');
        expect(page).toHaveBeenCalledWith(2);
        expect(document.body.querySelector('.snackbar')).not.toBeNull();
        expect(document.body.querySelector('dialog')).toBe(layout.previewDialog.dialog);
    });
});

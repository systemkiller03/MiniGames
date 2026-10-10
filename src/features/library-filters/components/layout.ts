import { createCategoriesLayout, createCategories } from '@/features/categories/components/layout';
import {
    createCategoriesErrorState,
    createCategoriesLoadingState,
} from '@/features/categories/components/layout';
import type { ApiLibraryCategory } from '@/features/categories/components/layout';
import { createSortDropdown } from './sort-dropdown';
import type { LibrarySortKey } from './sort-dropdown';

export type { LibrarySortKey } from './sort-dropdown';

const noopCategory = (): void => {};
const noopSort = (): void => {};

export type LibraryFiltersLayout = {
    element: HTMLDivElement;
    categories: HTMLUListElement;
    setHandlers: (
        onSort: (sortKey: LibrarySortKey) => void,
        onCategory: (categorySlug: string) => void,
    ) => void;
    setLoading: () => void;
    setError: (onRetry: () => void) => void;
    setCategories: (categories: ApiLibraryCategory[], selectedCategory: string) => void;
};

export function createLibraryFiltersLayout(): LibraryFiltersLayout {
    let onCategory: (categorySlug: string) => void = noopCategory;
    let onSort: (sortKey: LibrarySortKey) => void = noopSort;
    const element = document.createElement('div');
    element.className = 'library-filter-sort-bar';

    const categories = createCategoriesLayout(onCategory);
    const sortDropdown = createSortDropdown((sortKey) => onSort(sortKey));
    element.append(categories, sortDropdown);

    return {
        element,
        categories,
        setHandlers: (sortHandler, categoryHandler) => {
            onSort = sortHandler;
            onCategory = categoryHandler;
        },
        setLoading: () => {
            categories.dataset.state = 'loading';
            categories.replaceChildren(createCategoriesLoadingState());
        },
        setError: (onRetry) => {
            categories.dataset.state = 'error';
            categories.replaceChildren(createCategoriesErrorState(onRetry));
        },
        setCategories: (items, selectedCategory) => {
            const list = createCategories(items, selectedCategory, onCategory);
            categories.dataset.state = 'ready';
            categories.replaceChildren(...list.children);
        },
    };
}
import '../styles/library-filters.scss';

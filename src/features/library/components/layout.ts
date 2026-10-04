import { createCategories } from '@/features/categories/categories';
import { createGameDialog } from '@/features/game-dialog/game-dialog';
import { createPagination } from '@/features/pagination/pagination';
import { createSortDropdown, type LibrarySortKey } from '@/features/sort-dropdown/sort-dropdown';

export type LibraryLayout = {
    element: DocumentFragment;
    categories: HTMLElement;
    gameCards: HTMLElement;
    pagination: HTMLElement;
    snackbar: HTMLElement;
    previewDialog: ReturnType<typeof createGameDialog>;
};

export function createLibraryLayout(
    onSort: (sortKey: LibrarySortKey) => void,
    onCategory: (categorySlug: string) => void,
): LibraryLayout {
    const element = document.createDocumentFragment();
    const filterSortBar = document.createElement('div');
    filterSortBar.className = 'library-filter-sort-bar';

    const categories = createCategories([], 'all', onCategory);
    const sortDropdown = createSortDropdown(onSort);
    filterSortBar.append(categories, sortDropdown);

    const gameCards = document.createElement('section');
    gameCards.classList.add('game-cards');

    const pagination = createPagination();
    const snackbar = document.createElement('div');
    snackbar.className = 'library-snackbar';
    snackbar.setAttribute('role', 'status');
    snackbar.setAttribute('aria-live', 'polite');

    const previewDialog = createGameDialog();

    element.append(filterSortBar, gameCards, pagination, snackbar, previewDialog.dialog);
    return { element, categories, gameCards, pagination, snackbar, previewDialog };
}

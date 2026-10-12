import { createGameDialog } from '@/features/game-dialog';
import {
    type LibrarySortKey,
    type LibraryFiltersLayout,
} from '@/features/library-filters/components/layout';
import { type LibraryGameGridLayout } from '@/features/library-game-grid/components/layout';
import { type LibraryPaginationLayout } from '@/features/library-pagination/components/layout';
import { createSnackbar, type SnackbarControl } from '@/shared/components';

export type LibraryLayout = {
    element: DocumentFragment;
    filters: LibraryFiltersLayout;
    gameGrid: LibraryGameGridLayout;
    pagination: LibraryPaginationLayout;
    snackbar: SnackbarControl;
    previewDialog: ReturnType<typeof createGameDialog>;
};

export function createLibraryLayout(
    filters: LibraryFiltersLayout,
    gameGrid: LibraryGameGridLayout,
    pagination: LibraryPaginationLayout,
    onSort: (sortKey: LibrarySortKey) => void,
    onCategory: (categorySlug: string) => void,
    onPageChange: (page: number) => void,
): LibraryLayout {
    const element = document.createDocumentFragment();
    filters.setHandlers(onSort, onCategory);
    pagination.setPageChangeHandler(onPageChange);
    const snackbar = createSnackbar();

    const previewDialog = createGameDialog();

    element.append(snackbar.element, previewDialog.dialog);
    return { element, filters, gameGrid, pagination, snackbar, previewDialog };
}

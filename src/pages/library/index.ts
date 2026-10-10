import { createDescription } from '@/features/library-intro/components/layout';
import { createLibrary } from '@/features/library/components/layout';
import { createLibraryFiltersLayout } from '@/features/library-filters/components/layout';
import { createLibraryGameGridLayout } from '@/features/library-game-grid/components/layout';
import { createLibraryPaginationLayout } from '@/features/library-pagination/components/layout';

export function createLibraryPage(): HTMLElement {
    const page = document.createElement('div');
    const filters = createLibraryFiltersLayout();
    const gameGrid = createLibraryGameGridLayout();
    const pagination = createLibraryPaginationLayout();
    const dialogAndNotifications = createLibrary({ filters, gameGrid, pagination });
    page.append(
        createDescription('Game Library', 'Browse our collection of casual mini-games'),
        filters.element,
        gameGrid.element,
        pagination.element,
        dialogAndNotifications,
    );
    return page;
}

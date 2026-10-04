import './pagination.scss';
import { createPaginationButton as makePaginationButton } from '@/shared/components';
export { createPaginationButton } from '@/shared/components';

interface PaginationOptions {
    totalPages?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
}

export type PaginationControl = {
    element: HTMLElement;
    update: (totalPages: number, currentPage: number) => void;
};

export function createPagination({
    totalPages = 1,
    currentPage = 1,
    onPageChange,
}: PaginationOptions = {}): PaginationControl {
    const pagination = document.createElement('nav');
    pagination.className = 'pagination';
    pagination.setAttribute('aria-label', 'Pagination');
    const controls = document.createElement('div');
    pagination.append(controls);

    let pageCount = Math.max(1, Math.floor(totalPages));
    let selectedPage = Math.min(pageCount, Math.max(1, Math.floor(currentPage)));
    const mobileQuery = globalThis.matchMedia('(max-width: 480px)');

    function selectPage(page: number): void {
        if (page === selectedPage || page < 1 || page > pageCount) {
            return;
        }
        selectedPage = page;
        renderControls();
        onPageChange?.(selectedPage);
    }

    function renderControls(): void {
        const visiblePageLimit = mobileQuery.matches ? 3 : 4;
        const visiblePageCount = Math.min(pageCount, visiblePageLimit);
        const lastStart = Math.max(1, pageCount - visiblePageCount + 1);
        const firstPage = Math.min(
            lastStart,
            Math.max(1, selectedPage - Math.floor(visiblePageCount / 2)),
        );
        const pages = Array.from({ length: visiblePageCount }, (_, index) => firstPage + index);
        const previousButton = makePaginationButton({
            kind: 'prev',
            disabled: selectedPage === 1,
        });
        const nextButton = makePaginationButton({
            kind: 'next',
            disabled: selectedPage === pageCount,
        });
        const pageButtons = pages.map((page) => {
            const button = makePaginationButton({
                kind: 'page',
                children: String(page),
                selected: page === selectedPage,
            });
            button.addEventListener('click', () => selectPage(page));
            return button;
        });

        previousButton.addEventListener('click', () => selectPage(selectedPage - 1));
        nextButton.addEventListener('click', () => selectPage(selectedPage + 1));
        controls.replaceChildren(previousButton, ...pageButtons, nextButton);
    }

    function update(nextTotalPages: number, nextCurrentPage: number): void {
        pageCount = Math.max(1, Math.floor(nextTotalPages));
        selectedPage = Math.min(pageCount, Math.max(1, Math.floor(nextCurrentPage)));
        renderControls();
    }

    mobileQuery.addEventListener('change', renderControls);
    renderControls();

    return {
        element: pagination,
        update,
    };
}

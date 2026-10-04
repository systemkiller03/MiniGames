import './pagination.scss';
import { createPaginationButton as makePaginationButton } from '@/shared/components';
export { createPaginationButton } from '@/shared/components';

interface PaginationOptions {
    totalPages?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
}

export function createPagination({
    totalPages = 4,
    currentPage = 1,
    onPageChange,
}: PaginationOptions = {}): HTMLElement {
    const pagination = document.createElement('nav');
    pagination.className = 'pagination';
    pagination.setAttribute('aria-label', 'Pagination');

    const controls = document.createElement('div');

    const pageCount = Math.max(1, Math.floor(totalPages));
    let selectedPage = Math.min(pageCount, Math.max(1, Math.floor(currentPage)));
    const previousButton = makePaginationButton({
        kind: 'prev',
        disabled: selectedPage === 1,
    });
    const nextButton = makePaginationButton({
        kind: 'next',
        disabled: selectedPage === pageCount,
    });
    const pageButtons = Array.from({ length: pageCount }, (_, index) => {
        const page = index + 1;
        const button = makePaginationButton({
            kind: 'page',
            children: String(page),
            selected: page === selectedPage,
        });
        button.addEventListener('click', () => selectPage(page));
        return button;
    });

    function selectPage(page: number): void {
        if (page === selectedPage) {
            return;
        }
        selectedPage = page;
        updateControls();
        onPageChange?.(selectedPage);
    }

    function updateControls(): void {
        previousButton.disabled = selectedPage === 1;
        nextButton.disabled = selectedPage === pageCount;
        for (const [index, button] of pageButtons.entries()) {
            const isSelected = index + 1 === selectedPage;
            button.toggleAttribute('aria-current', isSelected);
            if (isSelected) {
                button.setAttribute('aria-current', 'page');
            }
        }
    }

    previousButton.addEventListener('click', () => selectPage(selectedPage - 1));
    nextButton.addEventListener('click', () => selectPage(selectedPage + 1));
    controls.append(previousButton, ...pageButtons, nextButton);
    pagination.append(controls);
    updateControls();

    return pagination;
}

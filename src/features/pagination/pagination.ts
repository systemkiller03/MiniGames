import'./pagination.scss';
import{ ChevronLeft, ChevronRight } from'lucide';
import{ createIconButton } from'../../shared/components/icon-button/icon-button';

interface PaginationOptions {
    totalPages?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
}

export function createPagination({
    totalPages = 4,
    currentPage = 1,
    onPageChange,
}: PaginationOptions = {}): HTMLElement{
    const pagination = document.createElement('nav');
    pagination.className = 'pagination';
    pagination.setAttribute('aria-label', 'Pagination');

    const controls = document.createElement('div');
    controls.className = 'pagination__controls';

    const previousButton = createIconButton(
        'Previous page',
        ChevronLeft,
        'pagination__button pagination__button--previous',
    );
    const nextButton = createIconButton(
        'Next page',
        ChevronRight,
        'pagination__button pagination__button--next',
    );

    const pageCount = Math.max(1, Math.floor(totalPages));
    let selectedPage = Math.min(pageCount, Math.max(1, Math.floor(currentPage)));
    const pageButtons = Array.from({ length: pageCount }, (_, index) => {
        const page = index + 1;
        const button = createPaginationButton(page);
        button.addEventListener('click', () => selectPage(page));
        return button;
    });

    function selectPage(page: number): void{
        if(page === selectedPage){
            return;
        }
        selectedPage = page;
        updateControls();
        onPageChange?.(selectedPage);
    }

    function updateControls(): void{
        previousButton.disabled = selectedPage === 1;
        nextButton.disabled = selectedPage === pageCount;
        for(const[index, button] of pageButtons.entries()){
            const isSelected = index + 1 === selectedPage;
            button.classList.toggle('is-active', isSelected);
            button.toggleAttribute('aria-current', isSelected);
            if(isSelected){
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

export function createPaginationButton(number: number): HTMLButtonElement{
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pagination__button';
    button.textContent = String(number);
    button.setAttribute('aria-label', `Page ${number}`);
    return button;
}

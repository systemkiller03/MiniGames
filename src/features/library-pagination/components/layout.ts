import { createPagination } from './page-controls';
import type { PaginationControl } from './page-controls';

export type { PaginationControl } from './page-controls';

const noopPageChange = (): void => {};
export type LibraryPaginationLayout = PaginationControl & {
    setPageChangeHandler: (onPageChange: (page: number) => void) => void;
};

export function createLibraryPaginationLayout(): LibraryPaginationLayout {
    let onPageChange: (page: number) => void = noopPageChange;
    const pagination = createPagination({ onPageChange: (page) => onPageChange(page) });
    return {
        ...pagination,
        setPageChangeHandler: (handler) => {
            onPageChange = handler;
        },
    };
}

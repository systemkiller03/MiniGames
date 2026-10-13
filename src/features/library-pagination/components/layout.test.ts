import { describe, expect, it, vi } from 'vitest';

import { createLibraryPaginationLayout } from './layout';

describe('createLibraryPaginationLayout', () => {
    it('forwards page selection to the current handler and allows handler replacement', () => {
        vi.stubGlobal('matchMedia', () => ({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));
        const pagination = createLibraryPaginationLayout();
        pagination.update(4, 1);
        const firstHandler = vi.fn();
        pagination.setPageChangeHandler(firstHandler);
        pagination.element.querySelector<HTMLButtonElement>('[data-kind="next"]')?.click();
        expect(firstHandler).toHaveBeenCalledWith(2);

        const nextHandler = vi.fn();
        pagination.setPageChangeHandler(nextHandler);
        pagination.update(4, 2);
        pagination.element.querySelector<HTMLButtonElement>('[data-kind="next"]')?.click();
        expect(nextHandler).toHaveBeenCalledWith(3);
    });
});

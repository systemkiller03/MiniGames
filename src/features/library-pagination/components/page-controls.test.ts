import { afterEach, describe, expect, it, vi } from 'vitest';

import { createPagination } from './page-controls';

afterEach(() => {
    vi.unstubAllGlobals();
});

describe('createPagination', () => {
    it('changes pages within bounds and updates disabled and selected controls', () => {
        const onPageChange = vi.fn();
        vi.stubGlobal('matchMedia', () => ({
            matches: false,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));
        const pagination = createPagination({
            totalPages: 5,
            currentPage: 1,
            onPageChange,
        });
        const previous = pagination.element.querySelector<HTMLButtonElement>('[data-kind="prev"]');
        const next = pagination.element.querySelector<HTMLButtonElement>('[data-kind="next"]');

        expect(previous?.disabled).toBe(true);
        expect(pagination.element.querySelector('[aria-current="page"]')?.textContent).toBe('1');
        next?.click();
        expect(onPageChange).toHaveBeenCalledWith(2);
        expect(pagination.element.querySelector('[aria-current="page"]')?.textContent).toBe('2');
        pagination.update(2, 99);
        expect(pagination.element.querySelector('[aria-current="page"]')?.textContent).toBe('2');
        expect(
            pagination.element.querySelector<HTMLButtonElement>('[data-kind="next"]')?.disabled,
        ).toBe(true);
    });

    it('shows a compact page window for mobile and clamps requested current pages', () => {
        const matchMedia = vi.fn(() => ({
            matches: true,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
        }));
        vi.stubGlobal('matchMedia', matchMedia);
        const pagination = createPagination({ totalPages: 8, currentPage: 99 });

        expect(pagination.element.querySelectorAll('[data-kind="page"]')).toHaveLength(3);
        expect(pagination.element.querySelector('[aria-current="page"]')?.textContent).toBe('8');
        expect(pagination.element.getAttribute('aria-label')).toBe('Pagination');
    });
});

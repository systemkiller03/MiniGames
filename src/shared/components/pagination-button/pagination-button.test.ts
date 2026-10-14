import { describe, expect, it } from 'vitest';

import { createPaginationButton } from './pagination-button';

describe('createPaginationButton', () => {
    it('creates a selected page button from numeric shorthand', () => {
        const button = createPaginationButton(3);

        expect(button.textContent).toBe('3');
        expect(button.getAttribute('aria-label')).toBe('Page 3');
        expect(button.dataset.kind).toBe('page');
        expect(button.disabled).toBe(false);
        expect(button.hasAttribute('aria-current')).toBe(false);
    });

    it('provides directional labels and handles selected and disabled options', () => {
        const previous = createPaginationButton({ kind: 'prev', disabled: true });
        const selected = createPaginationButton({
            kind: 'page',
            children: '5',
            selected: true,
        });

        expect(previous.getAttribute('aria-label')).toBe('Previous page');
        expect(previous.disabled).toBe(true);
        expect(previous.querySelector('svg')).not.toBeNull();
        expect(selected.getAttribute('aria-current')).toBe('page');
        expect(selected.getAttribute('aria-label')).toBe('Page 5');
    });

    it('appends node content without manufacturing a page label', () => {
        const label = document.createElement('strong');
        label.textContent = 'Current';
        const button = createPaginationButton({ kind: 'page', children: label });

        expect(button.firstElementChild).toBe(label);
        expect(button.hasAttribute('aria-label')).toBe(false);
    });
});

import { describe, expect, it } from 'vitest';

import { createCategoriesLoadingState } from './loading';

describe('createCategoriesLoadingState', () => {
    it('marks the category placeholder as a busy status', () => {
        const item = createCategoriesLoadingState();
        const state = item.firstElementChild;

        expect(item.tagName).toBe('LI');
        expect(state?.getAttribute('role')).toBe('status');
        expect(state?.getAttribute('aria-busy')).toBe('true');
        expect(state?.textContent).toBe('Loading categories');
    });
});

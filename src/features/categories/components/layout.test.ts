import { describe, expect, it } from 'vitest';

import { createCategoriesLayout } from './layout';

describe('createCategoriesLayout', () => {
    it('starts with an accessible loading row before category results arrive', () => {
        const layout = createCategoriesLayout(() => {});

        expect(layout.dataset.state).toBe('loading');
        expect(layout.querySelector('[aria-busy="true"]')?.textContent).toBe('Loading categories');
    });
});

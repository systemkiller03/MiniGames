import { describe, expect, it, vi } from 'vitest';

import { createCategoriesErrorState } from './error';

describe('createCategoriesErrorState', () => {
    it('announces the categories failure and invokes retry', () => {
        const onRetry = vi.fn();
        const state = createCategoriesErrorState(onRetry);

        expect(state.querySelector('[role="alert"]')?.textContent).toContain(
            'Could not load categories',
        );
        state.querySelector('button')?.click();
        expect(onRetry).toHaveBeenCalledOnce();
    });
});

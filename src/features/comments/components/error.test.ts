import { describe, expect, it, vi } from 'vitest';

import { createCommentsErrorState } from './error';

describe('createCommentsErrorState', () => {
    it('announces a failed comment load and retries the request', () => {
        const retry = vi.fn();
        const state = createCommentsErrorState(retry);

        expect(state.getAttribute('role')).toBe('alert');
        expect(state.textContent).toContain('Comments could not be loaded');
        state.querySelector('button')?.click();
        expect(retry).toHaveBeenCalledOnce();
    });
});

import { describe, expect, it, vi } from 'vitest';

import { createErrorState } from './error';

describe('createErrorState', () => {
    it('announces a games-load error and invokes retry on user action', () => {
        const retry = vi.fn();
        const state = createErrorState(retry);

        expect(state.getAttribute('role')).toBe('alert');
        expect(state.textContent).toContain('Could not load games');
        state.querySelector('button')?.click();
        expect(retry).toHaveBeenCalledOnce();
    });
});

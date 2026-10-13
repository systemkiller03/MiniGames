import { describe, expect, it, vi } from 'vitest';

import { createErrorState } from './error';

describe('createErrorState', () => {
    it('announces an unavailable game and retries when requested', () => {
        const retry = vi.fn();
        const state = createErrorState(retry);

        expect(state.getAttribute('role')).toBe('alert');
        expect(state.textContent).toContain('Could not load game details');
        state.querySelector('button')?.click();
        expect(retry).toHaveBeenCalledOnce();
    });
});

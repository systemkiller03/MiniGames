import { describe, expect, it, vi } from 'vitest';

import { createErrorState } from './error';

describe('createErrorState', () => {
    it('provides a retry action for leaderboard failures', () => {
        const retry = vi.fn();
        const state = createErrorState(retry);

        expect(state.getAttribute('role')).toBe('alert');
        expect(state.textContent).toContain('Could not load leaderboard');
        state.querySelector('button')?.click();
        expect(retry).toHaveBeenCalledOnce();
    });
});

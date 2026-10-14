import { describe, expect, it, vi } from 'vitest';

import { createErrorState } from './error';

describe('createErrorState', () => {
    it('exposes a retry action when featured games cannot be loaded', () => {
        const onRetry = vi.fn();
        const state = createErrorState(onRetry);

        expect(state.dataset.state).toBe('error');
        expect(state.getAttribute('role')).toBe('alert');
        expect(state.textContent).toContain('Could not load featured games');
        state.querySelector('button')?.click();
        expect(onRetry).toHaveBeenCalledOnce();
    });
});

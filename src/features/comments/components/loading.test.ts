import { describe, expect, it } from 'vitest';

import { createCommentsLoadingState } from './loading';

describe('createCommentsLoadingState', () => {
    it('announces that comments are loading', () => {
        const state = createCommentsLoadingState();

        expect(state.dataset.state).toBe('loading');
        expect(state.getAttribute('role')).toBe('status');
        expect(state.textContent).toBe('Loading comments…');
    });
});

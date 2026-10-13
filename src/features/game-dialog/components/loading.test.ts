import { describe, expect, it } from 'vitest';

import { createLoadingState } from './loading';

describe('createLoadingState', () => {
    it('marks the details placeholder busy and creates five shimmer lines', () => {
        const state = createLoadingState();

        expect(state.dataset.state).toBe('loading');
        expect(state.getAttribute('aria-busy')).toBe('true');
        expect(state.querySelectorAll('.game-dialog-loading-line')).toHaveLength(5);
        expect(state.textContent).toContain('Loading game details');
    });
});

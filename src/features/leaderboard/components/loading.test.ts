import { describe, expect, it } from 'vitest';

import { createLoadingState } from './loading';

describe('createLoadingState', () => {
    it('renders busy leaderboard rows during retrieval', () => {
        const state = createLoadingState();

        expect(state.getAttribute('aria-busy')).toBe('true');
        expect(state.textContent).toContain('Loading leaderboard');
        expect(state.querySelectorAll('.leaderboard-loading-row')).toHaveLength(5);
    });
});

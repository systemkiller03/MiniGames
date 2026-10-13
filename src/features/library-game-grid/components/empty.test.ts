import { describe, expect, it } from 'vitest';

import { createEmptyState } from './empty';

describe('createEmptyState', () => {
    it('explains that the current library query has no games', () => {
        const state = createEmptyState();

        expect(state.dataset.state).toBe('empty');
        expect(state.getAttribute('role')).toBe('status');
        expect(state.textContent).toContain('No games found');
        expect(state.textContent).toContain('Try again later');
    });
});

import { describe, expect, it } from 'vitest';

import { createEmptyState } from './empty';

describe('createEmptyState', () => {
    it('explains when the leaderboard has no players', () => {
        const state = createEmptyState();

        expect(state.dataset.state).toBe('empty');
        expect(state.getAttribute('role')).toBe('status');
        expect(state.textContent).toContain('No players found');
        expect(state.textContent).toContain('Please check back later');
    });
});

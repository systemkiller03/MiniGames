import { describe, expect, it } from 'vitest';

import { createEmptyState } from './empty';

describe('createEmptyState', () => {
    it('explains that no featured games are available', () => {
        const state = createEmptyState();

        expect(state.dataset.state).toBe('empty');
        expect(state.getAttribute('role')).toBe('status');
        expect(state.textContent).toContain('No featured games found');
        expect(state.textContent).toContain('Check back later');
    });
});

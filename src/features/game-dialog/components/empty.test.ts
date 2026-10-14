import { describe, expect, it } from 'vitest';

import { createEmptyState } from './empty';

describe('createEmptyState', () => {
    it('renders the default unavailable-details explanation', () => {
        const state = createEmptyState();

        expect(state.dataset.state).toBe('empty');
        expect(state.getAttribute('role')).toBe('status');
        expect(state.textContent).toContain('No details found');
        expect(state.textContent).toContain('No game details are available right now.');
    });

    it('shows a caller-provided empty-state explanation', () => {
        expect(createEmptyState('This title is unavailable.').textContent).toContain(
            'This title is unavailable.',
        );
    });
});

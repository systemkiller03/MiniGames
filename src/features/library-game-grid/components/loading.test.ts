import { describe, expect, it } from 'vitest';

import { createLoadingState } from './loading';

describe('createLoadingState', () => {
    it('renders six non-interactive game placeholders while loading', () => {
        const state = createLoadingState();

        expect(state.dataset.state).toBe('loading');
        expect(state.getAttribute('aria-busy')).toBe('true');
        expect(state.querySelectorAll('.library-loading-card')).toHaveLength(6);
        expect(
            [...state.querySelectorAll('.library-loading-card')].every(
                (card) => card.getAttribute('aria-hidden') === 'true',
            ),
        ).toBe(true);
    });
});

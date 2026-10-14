import { describe, expect, it } from 'vitest';

import { createLoadingState } from './loading';

describe('createLoadingState', () => {
    it('renders five busy placeholders while featured games load', () => {
        const state = createLoadingState();

        expect(state.dataset.state).toBe('loading');
        expect(state.getAttribute('aria-busy')).toBe('true');
        expect(state.querySelectorAll('.carousel-loading-card')).toHaveLength(5);
        expect(state.textContent).toContain('Loading featured games');
    });
});

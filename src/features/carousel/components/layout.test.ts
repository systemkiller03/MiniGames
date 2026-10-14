import { describe, expect, it } from 'vitest';

import { createCarouselLayout } from './layout';

describe('createCarouselLayout', () => {
    it('labels the featured-game controls and hides them before data loads', () => {
        const layout = createCarouselLayout();

        expect(layout.element.getAttribute('aria-labelledby')).toBe('carousel-title');
        expect(layout.viewport.getAttribute('aria-label')).toBe('Featured games slider');
        expect(layout.previousButton.getAttribute('aria-label')).toBe('Previous games');
        expect(layout.nextButton.getAttribute('aria-label')).toBe('Next games');
        expect(layout.controls.hidden).toBe(true);
        expect(layout.indicators.hidden).toBe(true);
    });
});

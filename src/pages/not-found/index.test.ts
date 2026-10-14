import { describe, expect, it } from 'vitest';

import { createNotFoundPage } from './index';

describe('createNotFoundPage', () => {
    it('explains the missing route and links back to the app home', () => {
        const page = createNotFoundPage();
        const homeLink = page.querySelector('a');

        expect(page.getAttribute('aria-labelledby')).toBe('not-found-title');
        expect(page.querySelector('.not-found-code')?.textContent).toBe('404');
        expect(page.querySelector('h1')?.textContent).toBe('Page not found');
        expect(homeLink?.textContent).toBe('Return to Home Page');
        expect(homeLink?.getAttribute('href')).toBe(import.meta.env.BASE_URL);
    });
});

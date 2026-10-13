import { describe, expect, it } from 'vitest';

import { createDeveloperSection } from './developer';

describe('createDeveloperSection', () => {
    it('exposes the developer contact details and accessible illustration', () => {
        const section = createDeveloperSection();

        expect(section.getAttribute('aria-labelledby')).toBe('developer-title');
        expect(section.querySelector('h2')?.textContent).toBe('Are You a Game Developer?');
        expect(section.querySelector('img')?.alt).toBe('A game developer working at a computer');
        expect(section.querySelector('button')?.textContent).toBe('Submit Form');
        expect(
            section.querySelector('a[href="mailto:developers@minigames.com"]')?.textContent,
        ).toBe('developers@minigames.com');
    });
});

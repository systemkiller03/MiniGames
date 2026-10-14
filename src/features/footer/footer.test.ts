import { describe, expect, it } from 'vitest';

import { createFooter } from './footer';

describe('createFooter', () => {
    it('renders navigation columns, social links, and safe external credits', () => {
        const footer = createFooter();
        const explore = footer.querySelector(':scope nav[aria-labelledby="footer-explore"]');
        const company = footer.querySelector(':scope nav[aria-labelledby="footer-company"]');
        const credits = footer.querySelectorAll(':scope .footer-credit');

        expect(footer.querySelector(':scope .footer-about')?.textContent).toContain(
            'No download required.',
        );
        expect(explore?.querySelectorAll(':scope a')).toHaveLength(4);
        expect(company?.querySelectorAll(':scope a')).toHaveLength(4);
        expect(footer.querySelector(':scope [aria-label="RSS feed"] img')).not.toBeNull();
        expect(credits).toHaveLength(2);
        expect(credits[0]?.getAttribute('rel')).toBe('noreferrer noopener');
        expect(credits[1]?.getAttribute('href')).toBe('https://github.com/systemkiller03');
    });
});

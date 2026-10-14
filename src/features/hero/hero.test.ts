import { describe, expect, it } from 'vitest';

import { createHero } from './hero';

describe('createHero', () => {
    it('describes the game catalog and presents its library call to action', () => {
        const hero = createHero();
        const button = hero.querySelector('button');

        expect(hero.getAttribute('aria-labelledby')).toBe('hero-title');
        expect(hero.querySelector('h1')?.textContent).toBe('Take a Short Break & Have Fun');
        expect(hero.querySelector('p')?.textContent).toContain(
            'hundreds of curated casual mini-games',
        );
        expect(button?.textContent).toBe('Browse Library');
        expect(hero.style.getPropertyValue('--hero-image')).toContain('url(');
    });
});

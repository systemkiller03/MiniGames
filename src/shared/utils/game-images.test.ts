import { describe, expect, it } from 'vitest';

import { getCardImage, getHeroImage } from './game-images';

describe('game image lookup', () => {
    it('resolves card and hero assets from their local filenames', () => {
        expect(getCardImage('camper-van-make-it-home-card.jpg')).toContain(
            'camper-van-make-it-home-card',
        );
        expect(getCardImage('/assets/tiny-glade-card.jpg')).toContain('tiny-glade-card');
        expect(getHeroImage('tiny-glade', 'fallback.jpg')).toContain('tiny-glade-hero');
    });

    it('returns undefined for unknown card files and keeps the requested hero fallback', () => {
        expect(getCardImage('missing-card.jpg')).toBeUndefined();
        expect(getCardImage('')).toBeUndefined();
        expect(getHeroImage('missing-game', 'fallback.jpg')).toBe('fallback.jpg');
    });
});

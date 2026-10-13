import { afterEach, describe, expect, it, vi } from 'vitest';

import { renderCarouselGames } from './carousel';
import { createCarouselLayout } from './layout';

const games = Array.from({ length: 6 }, (_, index) => ({
    slug: `game-${index}`,
    name: `Game ${index}`,
    category: 'puzzle',
    price: 'Free',
    shortDescription: `Description ${index}`,
    rating: 4.5,
    likesCount: 12,
    cardImage: 'tiny-glade-card.jpg',
}));

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.replaceChildren();
});

describe('renderCarouselGames', () => {
    it('updates visible game state through indicators, controls, and autoplay', () => {
        vi.useFakeTimers();
        const layout = createCarouselLayout();
        renderCarouselGames(games, layout);

        expect(layout.controls.hidden).toBe(false);
        expect(layout.indicators.hidden).toBe(false);
        expect(layout.viewport.querySelectorAll('[data-game-slug]')).toHaveLength(6);
        expect(
            layout.viewport.querySelector<HTMLElement>('[aria-hidden="true"]')?.dataset.gameSlug,
        ).toBe('game-3');
        expect(layout.element.dataset.currentGame).toBe('game-0');

        layout.indicators
            .querySelector<HTMLElement>('[aria-label="Show Game 3 in center"]')
            ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(layout.element.dataset.currentIndex).toBe('3');
        expect(layout.element.dataset.currentGame).toBe('game-3');
        layout.nextButton.click();
        expect(layout.element.dataset.currentIndex).toBe('4');
        layout.previousButton.click();
        expect(layout.element.dataset.currentIndex).toBe('3');

        vi.advanceTimersByTime(4000);
        expect(layout.element.dataset.currentIndex).toBe('4');
        expect(
            layout.indicators
                .querySelector<HTMLElement>('[aria-label="Show Game 4 in center"]')
                ?.getAttribute('aria-current'),
        ).toBe('true');
    });

    it('opens game details when a featured card receives keyboard activation', async () => {
        vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
        vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
        vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'carousel-test');
        vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
        vi.stubEnv('VITE_API_URL', 'https://api.example.com');
        vi.stubGlobal(
            'fetch',
            vi.fn(async (input) =>
                String(input).includes('/comments')
                    ? Response.json({ comments: [], totalCount: 0 })
                    : Response.json({
                          data: {
                              slug: 'game-0',
                              name: 'Game 0',
                              heroImage: '',
                              rating: 4,
                              likesCount: 1,
                              isLikedByCurrentUser: false,
                              fullDescription: 'Details',
                              specs: {
                                  genre: 'Puzzle',
                                  players: 'Solo',
                                  duration: '15 min',
                                  price: 'Free',
                              },
                              topRecords: [],
                          },
                      }),
            ),
        );
        const layout = createCarouselLayout();
        renderCarouselGames(games.slice(0, 5), layout);
        const card = layout.viewport.querySelector<HTMLElement>('[data-game-slug="game-0"]');
        const activation = new KeyboardEvent('keydown', {
            key: 'Enter',
            bubbles: true,
            cancelable: true,
        });
        card?.dispatchEvent(activation);

        expect(activation.defaultPrevented).toBe(true);
        expect(layout.element.querySelector('dialog')?.hasAttribute('open')).toBe(true);
        await vi.waitFor(() => {
            expect(layout.element.querySelector('dialog')?.textContent).toContain('Game 0');
        });
    });

    it('rejects a game whose local card asset cannot be resolved', () => {
        const layout = createCarouselLayout();

        expect(() =>
            renderCarouselGames(
                [{ ...games[0]!, slug: 'missing', cardImage: 'missing-card.jpg' }],
                layout,
            ),
        ).toThrow('Local card image not found for missing');
    });
});

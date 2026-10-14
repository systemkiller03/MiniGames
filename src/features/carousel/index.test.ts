import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'carousel-index');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.useRealTimers();
});

describe('createCarousel', () => {
    it('renders the empty state when no featured games are returned', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue(Response.json({ data: [] })));
        const { createCarousel } = await import('./index');
        const carousel = createCarousel();

        await vi.waitFor(() => {
            expect(carousel.querySelector('[data-state="empty"]')?.textContent).toContain(
                'No featured games found',
            );
        });
    });

    it('shows an error and retries the request after a failed response', async () => {
        const game = {
            slug: 'tiny-glade',
            name: 'Tiny Glade',
            category: 'puzzle',
            price: 'Free',
            shortDescription: 'Build a village',
            rating: 4.9,
            likesCount: 9,
            cardImage: 'tiny-glade-card.jpg',
        };
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(new Response('', { status: 503 }))
            .mockResolvedValueOnce(Response.json({ data: [game] }));
        vi.stubGlobal('fetch', fetchMock);
        const { createCarousel } = await import('./index');
        const carousel = createCarousel();

        await vi.waitFor(() => {
            expect(carousel.querySelector(':scope [data-state="error"]')).not.toBeNull();
        });
        carousel.querySelector<HTMLButtonElement>(':scope [data-state="error"] button')?.click();
        await vi.waitFor(() => {
            expect(
                carousel.querySelector(':scope [data-track] [data-game-slug="tiny-glade"]'),
            ).not.toBeNull();
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });
});

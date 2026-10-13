import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('getFeaturedGames', () => {
    it('loads featured games from the featured-games endpoint', async () => {
        const games = [{ slug: 'tiny-glade', name: 'Tiny Glade' }];
        const fetchMock = vi.fn().mockResolvedValue(Response.json({ data: games }));
        vi.stubGlobal('fetch', fetchMock);
        const { getFeaturedGames } = await import('./carousel.api');

        await expect(getFeaturedGames()).resolves.toEqual(games);
        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.example.com/games?featured=true',
            expect.any(Object),
        );
    });

    it('returns an empty list for absent data and propagates HTTP failures', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(Response.json({}))
            .mockResolvedValueOnce(new Response('', { status: 500 }));
        vi.stubGlobal('fetch', fetchMock);
        const { getFeaturedGames } = await import('./carousel.api');

        await expect(getFeaturedGames()).resolves.toEqual([]);
        await expect(getFeaturedGames()).rejects.toThrow('API request failed with status 500');
    });
});

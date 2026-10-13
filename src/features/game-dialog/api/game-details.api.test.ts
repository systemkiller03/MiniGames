import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.resetModules();
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('game-details.api', () => {
    it('requests game details with an optional encoded user email', async () => {
        const details = { slug: 'cozy-sudoku', name: 'Cozy Sudoku' };
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(Response.json({ data: details }))
            .mockResolvedValueOnce(Response.json({ data: details }));
        vi.stubGlobal('fetch', fetchMock);
        const { getGameDetails } = await import('./game-details.api');

        await expect(getGameDetails('cozy-sudoku', 'ada@example.com')).resolves.toEqual(details);
        await expect(getGameDetails('cozy-sudoku')).resolves.toEqual(details);
        expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
            'https://api.example.com/games/cozy-sudoku?userEmail=ada%40example.com',
        );
        expect(String(fetchMock.mock.calls[1]?.[0])).toBe(
            'https://api.example.com/games/cozy-sudoku',
        );
    });

    it('posts favorite toggles and rejects missing or malformed API payloads', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(Response.json({ data: { isFavorited: true, likesCount: 4 } }))
            .mockResolvedValueOnce(Response.json({}))
            .mockResolvedValueOnce(Response.json({ data: { isFavorited: 'yes', likesCount: 4 } }))
            .mockResolvedValueOnce(new Response('', { status: 503 }));
        vi.stubGlobal('fetch', fetchMock);
        const { getGameDetails, toggleGameFavorite } = await import('./game-details.api');

        await expect(toggleGameFavorite('cozy-sudoku', 'ada@example.com')).resolves.toEqual({
            isFavorited: true,
            likesCount: 4,
        });
        expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
            method: 'POST',
            body: JSON.stringify({ userEmail: 'ada@example.com' }),
        });
        await expect(getGameDetails('missing')).rejects.toThrow(
            'Game details not found for missing',
        );
        await expect(toggleGameFavorite('cozy-sudoku', 'ada@example.com')).rejects.toThrow(
            'Favorite state not returned for cozy-sudoku',
        );
        await expect(toggleGameFavorite('cozy-sudoku', 'ada@example.com')).rejects.toThrow(
            'API request failed with status 503',
        );
    });
});

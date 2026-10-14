import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('getLeaderboardPlayers', () => {
    it('requests and returns leaderboard player data', async () => {
        const players = [{ rank: 1, playerName: 'Ada' }];
        const fetchMock = vi.fn().mockResolvedValue(Response.json({ data: players }));
        vi.stubGlobal('fetch', fetchMock);
        const { getLeaderboardPlayers } = await import('./leaderboard.api');

        await expect(getLeaderboardPlayers()).resolves.toEqual(players);
        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.example.com/leaderboard',
            expect.any(Object),
        );
    });

    it('returns an empty list when data is absent and rejects server errors', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(Response.json({}))
            .mockResolvedValueOnce(new Response('', { status: 503 }));
        vi.stubGlobal('fetch', fetchMock);
        const { getLeaderboardPlayers } = await import('./leaderboard.api');

        await expect(getLeaderboardPlayers()).resolves.toEqual([]);
        await expect(getLeaderboardPlayers()).rejects.toThrow('API request failed with status 503');
    });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.resetModules();
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('getLibraryGames', () => {
    it('uses default query values and returns page metadata', async () => {
        const data = [{ slug: 'cozy-sudoku' }];
        const fetchMock = vi
            .fn()
            .mockResolvedValue(Response.json({ data, meta: { page: 1, totalPages: 3 } }));
        vi.stubGlobal('fetch', fetchMock);
        const { getLibraryGames } = await import('./library.api');

        await expect(getLibraryGames()).resolves.toEqual({ data, page: 1, totalPages: 3 });
        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.example.com/games?category=all&sort=rating-desc&page=1&limit=6',
            expect.any(Object),
        );
    });

    it('encodes supplied query values, clamps empty results, and rejects invalid response data', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(Response.json({ data: [], meta: { page: 9, totalPages: 0 } }))
            .mockResolvedValueOnce(Response.json({ data: [], meta: { page: 1, totalPages: 1 } }))
            .mockResolvedValueOnce(Response.json({ data: [{}], meta: { page: 3, totalPages: 2 } }));
        vi.stubGlobal('fetch', fetchMock);
        const { getLibraryGames } = await import('./library.api');

        await expect(
            getLibraryGames({ category: 'cozy games', sort: 'name asc', page: 2, limit: 4 }),
        ).resolves.toMatchObject({ page: 1, totalPages: 0 });
        expect(String(fetchMock.mock.calls[0]?.[0])).toContain(
            'category=cozy+games&sort=name+asc&page=2&limit=4',
        );
        await expect(getLibraryGames()).resolves.toEqual({
            data: [],
            page: 1,
            totalPages: 1,
        });
        await expect(getLibraryGames()).rejects.toThrow(
            'Invalid games response: expected data, page, and totalPages',
        );
    });
});

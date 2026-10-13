import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.resetModules();
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('getLibraryCategories', () => {
    it('returns category data from the categories endpoint', async () => {
        const categories = [{ slug: 'puzzle', label: 'Puzzle', isDefault: true }];
        const fetchMock = vi.fn().mockResolvedValue(Response.json({ data: categories }));
        vi.stubGlobal('fetch', fetchMock);
        const { getLibraryCategories } = await import('./categories.api');

        await expect(getLibraryCategories()).resolves.toEqual(categories);
        expect(fetchMock).toHaveBeenCalledWith(
            'https://api.example.com/categories',
            expect.objectContaining({ headers: { Accept: 'application/json' } }),
        );
    });

    it('rejects malformed category data and failed HTTP requests', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(Response.json({}))
            .mockResolvedValueOnce(new Response('', { status: 500 }));
        vi.stubGlobal('fetch', fetchMock);
        const { getLibraryCategories } = await import('./categories.api');

        await expect(getLibraryCategories()).rejects.toThrow(
            'Invalid categories response: expected data',
        );
        await expect(getLibraryCategories()).rejects.toThrow('API request failed with status 500');
    });
});

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.resetModules();
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('apiClient', () => {
    it('joins the configured base URL and merges JSON and caller headers', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValue(Response.json({ result: 'ok' }, { status: 200 }));
        vi.stubGlobal('fetch', fetchMock);
        const { apiClient } = await import('./api-client');

        await expect(
            apiClient<{ result: string }>('/games', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'Puzzle' }),
            }),
        ).resolves.toEqual({ result: 'ok' });
        expect(fetchMock).toHaveBeenCalledWith('https://api.example.com/games', {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: 'Puzzle' }),
        });
    });

    it('rejects non-success responses and propagates network errors', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(new Response('', { status: 503 }))
            .mockRejectedValueOnce(new TypeError('Failed to fetch'));
        vi.stubGlobal('fetch', fetchMock);
        const { apiClient } = await import('./api-client');

        await expect(apiClient('/games')).rejects.toThrow('API request failed with status 503');
        await expect(apiClient('/games')).rejects.toThrow('Failed to fetch');
    });

    it('fails clearly when the base URL is not configured', async () => {
        vi.stubEnv('VITE_API_URL', '');
        vi.resetModules();

        await expect(import('./api-client')).rejects.toThrow('VITE_API_URL is not defined');
    });
});

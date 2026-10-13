import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('createLeaderboard', () => {
    it('renders player data from the leaderboard API', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue(
                Response.json({
                    data: [
                        {
                            rank: 1,
                            playerName: 'Ada Lovelace',
                            gamesPlayed: 10,
                            totalScore: 900,
                            streakDays: 2,
                            favoriteGameName: 'Tiny Glade',
                        },
                    ],
                }),
            ),
        );
        const { createLeaderboard } = await import('./index');
        const leaderboard = createLeaderboard();

        await vi.waitFor(() => {
            expect(leaderboard.querySelector('tbody')?.textContent).toContain('Ada Lovelace');
        });
        expect(leaderboard.textContent).toContain('Tiny Glade');
    });

    it('renders an empty state or a retry action when the API has no data or fails', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(Response.json({ data: [] }))
            .mockResolvedValueOnce(new Response('', { status: 503 }))
            .mockResolvedValueOnce(Response.json({ data: [] }));
        vi.stubGlobal('fetch', fetchMock);
        const { createLeaderboard } = await import('./index');
        const empty = createLeaderboard();

        await vi.waitFor(() => {
            expect(empty.querySelector('[data-state="empty"]')).not.toBeNull();
        });

        const failed = createLeaderboard();
        await vi.waitFor(() => {
            expect(failed.querySelector('[data-state="error"]')).not.toBeNull();
        });
        failed
            .querySelector(':scope [data-state="error"] button')
            ?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await vi.waitFor(() => {
            expect(failed.querySelector('[data-state="empty"]')).not.toBeNull();
        });
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });
});

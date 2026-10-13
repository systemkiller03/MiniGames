import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const details = {
    slug: 'cozy-sudoku',
    name: 'Cozy Sudoku',
    heroImage: 'cozy-sudoku-hero.jpg',
    rating: 4.8,
    likesCount: 10,
    isLikedByCurrentUser: false,
    fullDescription: 'A relaxing puzzle.',
    specs: { genre: 'Puzzle', players: 'Solo', duration: '15 min', price: 'Free' },
    topRecords: [
        { position: 1, playerName: 'Ada', score: 1000, achievedAt: '2026-01-01T00:00:00Z' },
        { position: 2, playerName: 'Bo', score: 900, achievedAt: '2025-12-31T00:00:00Z' },
        { position: 3, playerName: 'Cy', score: 800, achievedAt: '2025-12-30T00:00:00Z' },
    ],
};

beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'game-dialog-test');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.stubGlobal(
        'fetch',
        vi.fn(async (input, init) => {
            const url = String(input);
            if (url.includes('/favorite') && init?.method === 'POST') {
                return Response.json({ data: { isFavorited: true, likesCount: 11 } });
            }
            return url.includes('/comments')
                ? Response.json({ comments: [], totalCount: 0 })
                : Response.json({ data: details });
        }),
    );
    localStorage.clear();
    document.body.replaceChildren();
    globalThis.history.replaceState(undefined, '', '/MiniGames/');
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    document.body.replaceChildren();
});

describe('createGameDialog', () => {
    it('loads detail and comment data, updates favorite state, and clears game route on close', async () => {
        const { clearAppSession, saveAppSession } = await import('@/features/auth/api/auth.api');
        saveAppSession({
            displayName: 'Ada',
            email: 'ada@example.com',
            authenticatedAt: Date.now(),
        });
        const { createGameDialog } = await import('./index');
        const game = createGameDialog({
            slug: 'cozy-sudoku',
            title: 'Cozy Sudoku',
            image: 'cozy-sudoku-card.jpg',
            category: 'Puzzle',
            price: 'Free',
            rating: 4,
            likes: 1,
            description: 'A game',
            players: 'Solo',
            duration: '15 min',
        });

        await game.open();
        expect(game.dialog.textContent).toContain('Cozy Sudoku');
        expect(game.dialog.textContent).toContain('Ada');
        expect(new URL(globalThis.location.href).searchParams.get('game')).toBe('cozy-sudoku');
        await vi.waitFor(() => {
            expect(game.dialog.textContent).toContain('Comments (0)');
        });

        game.dialog.querySelector<HTMLButtonElement>('.game-dialog-favorite')?.click();
        await vi.waitFor(() => {
            const favorite = game.dialog.querySelector<HTMLButtonElement>('.game-dialog-favorite');
            expect(favorite?.getAttribute('aria-pressed')).toBe('true');
            expect(favorite?.textContent).toContain('11');
        });
        expect(fetch).toHaveBeenCalledWith(
            'https://api.example.com/games/cozy-sudoku/favorite',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ userEmail: 'ada@example.com' }),
            }),
        );

        clearAppSession();
        await vi.waitFor(() => {
            expect(
                game.dialog
                    .querySelector<HTMLButtonElement>('.game-dialog-favorite')
                    ?.getAttribute('aria-pressed'),
            ).toBe('false');
        });
        expect(game.dialog.querySelector<HTMLTextAreaElement>('textarea')?.disabled).toBe(true);
        game.close();
        expect(new URL(globalThis.location.href).searchParams.has('game')).toBe(false);
    });

    it('requests auth instead of mutating favorites for a guest', async () => {
        const authRequired = vi.fn();
        globalThis.addEventListener('app-auth-required', authRequired);
        const { createGameDialog } = await import('./index');
        const game = createGameDialog({
            slug: 'cozy-sudoku',
            title: 'Cozy Sudoku',
            image: 'cozy-sudoku-card.jpg',
            category: 'Puzzle',
            price: 'Free',
            rating: 4,
            likes: 1,
            description: 'A game',
            players: 'Solo',
            duration: '15 min',
        });
        await game.open();
        game.dialog.querySelector<HTMLButtonElement>('.game-dialog-favorite')?.click();

        expect(new URL(globalThis.location.href).searchParams.get('auth')).toBe('login');
        expect(new URL(globalThis.location.href).searchParams.get('game')).toBe('cozy-sudoku');
        expect(authRequired).toHaveBeenCalledOnce();
        expect(vi.mocked(fetch).mock.calls.some(([, init]) => init?.method === 'POST')).toBe(false);
        globalThis.removeEventListener('app-auth-required', authRequired);
    });

    it('rolls favorite state back and notifies the user when the API rejects the update', async () => {
        const { saveAppSession } = await import('@/features/auth/api/auth.api');
        saveAppSession({
            displayName: 'Ada',
            email: 'ada@example.com',
            authenticatedAt: Date.now(),
        });
        vi.mocked(fetch).mockImplementation(async (input, init) =>
            String(input).includes('/favorite') && init?.method === 'POST'
                ? new Response('', { status: 503 })
                : Response.json({ data: details }),
        );
        const { createGameDialog } = await import('./index');
        const game = createGameDialog({
            slug: 'cozy-sudoku',
            title: 'Cozy Sudoku',
            image: 'cozy-sudoku-card.jpg',
            category: 'Puzzle',
            price: 'Free',
            rating: 4,
            likes: 10,
            description: 'A game',
            players: 'Solo',
            duration: '15 min',
        });
        await game.open();
        game.dialog.querySelector<HTMLButtonElement>('.game-dialog-favorite')?.click();

        await vi.waitFor(() => {
            expect(document.body.textContent).toContain(
                'Unable to update favorites right now. Please try again.',
            );
        });
        const favorite = game.dialog.querySelector<HTMLButtonElement>('.game-dialog-favorite');
        expect(favorite?.getAttribute('aria-pressed')).toBe('false');
        expect(favorite?.textContent).toContain('10');
        expect(favorite?.disabled).toBe(false);
    });

    it('shows unavailable and retryable error states from the details API', async () => {
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockResolvedValueOnce(Response.json({ data: { ...details, name: '' } }));
        const { createGameDialog } = await import('./index');
        const game = createGameDialog({
            slug: 'cozy-sudoku',
            title: 'Cozy Sudoku',
            image: 'cozy-sudoku-card.jpg',
            category: 'Puzzle',
            price: 'Free',
            rating: 4,
            likes: 1,
            description: 'A game',
            players: 'Solo',
            duration: '15 min',
        });
        await game.open();
        expect(game.dialog.textContent).toContain('This game is not available right now.');

        fetchMock.mockResolvedValueOnce(new Response('', { status: 503 }));
        await game.open();
        expect(game.dialog.textContent).toContain('Could not load game details');
        fetchMock.mockResolvedValueOnce(Response.json({ data: details }));
        game.dialog.querySelector<HTMLButtonElement>(':scope .game-dialog-state button')?.click();
        await vi.waitFor(() => {
            expect(game.dialog.textContent).toContain('Cozy Sudoku');
        });
    });
});

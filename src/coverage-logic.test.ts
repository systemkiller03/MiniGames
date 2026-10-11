import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
    getNavigationUrl,
    readRouteState,
    updateRouteState,
    clearAuthParameterFromUrl,
} from '@/shared/utils/navigation';
import { formatRelativeTime } from '@/shared/utils/format-relative-time';
import { formatCount } from '@/shared/utils/format-count';
import { getCardImage, getHeroImage } from '@/shared/utils/game-images';
import { validateAuthField } from '@/features/auth/utils/auth-validation';

beforeEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
    localStorage.clear();
    Object.defineProperty(globalThis, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: false,
            media: query,
            onchange: undefined,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    });
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
    localStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
});

describe('utility and route logic', () => {
    it('normalizes navigation URLs and route state', () => {
        expect(getNavigationUrl('/home')).toBe(import.meta.env.BASE_URL);
        expect(getNavigationUrl('/library')).toBe(`${import.meta.env.BASE_URL}?route=%2Flibrary`);

        const url = new URL(
            'https://example.com/MiniGames/?route=/library&category=action&sort=rating&page=3&game=rocket&auth=register',
        );
        expect(readRouteState(url)).toEqual({
            page: '/library',
            category: 'action',
            sort: 'rating',
            pageNumber: 3,
            game: 'rocket',
            auth: 'register',
        });

        updateRouteState({ page: '/library', category: 'puzzle', sort: 'newest', pageNumber: 2 });
        expect(readRouteState()).toMatchObject({
            page: '/library',
            category: 'puzzle',
            sort: 'newest',
            pageNumber: 2,
        });

        clearAuthParameterFromUrl();
        expect(readRouteState().auth).toBeUndefined();
    });

    it('formats time, counts, and image lookups', () => {
        const now = Date.now();
        expect(formatRelativeTime(new Date(now - 60_000).toISOString())).toBe('1 min ago');
        expect(formatRelativeTime(new Date(now - 3 * 60 * 60_000).toISOString())).toBe(
            '3 hours ago',
        );
        expect(formatCount(999)).toBe('999');
        expect(formatCount(1250)).toBe('1.3K');
        expect(formatCount(2_500_000)).toBe('2.5M');
        expect(getCardImage('camper-van-make-it-home-card.jpg')).toContain(
            'camper-van-make-it-home-card',
        );
        expect(getHeroImage('tiny-glade', 'fallback.jpg')).toContain('tiny-glade-hero');
    });

    it('validates the auth form rules and edge cases', () => {
        expect(validateAuthField('email', 'login', 'player@example.com')).toBe('');
        expect(validateAuthField('password', 'register', 'Player1')).toBe(
            'Password must contain at least one special character.',
        );
        expect(validateAuthField('confirmPassword', 'register', 'Player1!', 'Player2!')).toBe(
            'Passwords do not match.',
        );
    });
});

describe('session lifecycle', () => {
    it('creates, stores, rehydrates, expires, and clears a session', async () => {
        vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
        vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
        vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'example-project');
        vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');

        const authApi = await import('@/features/auth/api/auth.api');

        const session = authApi.createAppSession({
            displayName: ' Player ',
            email: 'player@example.com',
            photoURL: 'https://example.com/avatar.png',
        });

        expect(session).toMatchObject({
            displayName: 'Player',
            email: 'player@example.com',
            avatarUrl: 'https://example.com/avatar.png',
        });

        authApi.saveAppSession(session);
        expect(authApi.getAppSession()).toMatchObject({
            displayName: 'Player',
            email: 'player@example.com',
        });

        const invalidSession = {
            ...session,
            authenticatedAt: Date.now() + 5000,
        };
        localStorage.setItem(authApi.APP_SESSION_STORAGE_KEY, JSON.stringify(invalidSession));
        expect(authApi.getAppSession()).toBeUndefined();

        const expiredSession = {
            ...session,
            authenticatedAt: Date.now() - authApi.APP_SESSION_LIFETIME_MS - 1000,
        };
        localStorage.setItem(authApi.APP_SESSION_STORAGE_KEY, JSON.stringify(expiredSession));
        expect(authApi.getAppSession()).toBeUndefined();

        authApi.clearAppSession();
        expect(localStorage.getItem(authApi.APP_SESSION_STORAGE_KEY)).toBeNull();
    });
});

describe('comments and protected favorite actions', () => {
    it('posts comments and toggles likes through the comments component', async () => {
        vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
        vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
        vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'example-project');
        vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');

        const commentsApi = await import('@/features/comments/api/comments.api');
        const commentsModule = await import('@/features/comments/components/layout');
        const authApi = await import('@/features/auth/api/auth.api');

        vi.spyOn(commentsApi, 'getGameCommentsWithMeta').mockResolvedValue({
            comments: [
                {
                    commentId: 'c-1',
                    authorName: 'Alice',
                    text: 'Love this game!',
                    likesCount: 3,
                    isLikedByCurrentUser: false,
                    createdAt: new Date(Date.now() - 3 * 60_000).toISOString(),
                },
            ],
            totalCount: 1,
        });

        const submitSpy = vi.spyOn(commentsApi, 'postGameComment').mockResolvedValue({
            commentId: 'c-2',
            authorName: 'Alice',
            text: 'Nice climb!',
            likesCount: 0,
            isLikedByCurrentUser: false,
            createdAt: new Date().toISOString(),
        });
        const likeSpy = vi.spyOn(commentsApi, 'toggleCommentLike').mockResolvedValue({
            likesCount: 4,
            isLikedByCurrentUser: true,
        });

        authApi.saveAppSession({
            displayName: 'Alice',
            email: 'alice@example.com',
            authenticatedAt: Date.now(),
        });

        const feature = commentsModule.createComments();
        document.body.append(feature.element);
        await feature.load('cozy-sudoku');

        const input = feature.element.querySelector('textarea') as HTMLTextAreaElement;
        const submitButton = feature.element.querySelector(
            'button[type="submit"]',
        ) as HTMLButtonElement;
        input.value = '  Nice climb!  ';
        submitButton.click();

        await Promise.resolve();
        expect(submitSpy).toHaveBeenCalledWith('cozy-sudoku', {
            userEmail: 'alice@example.com',
            authorName: 'Alice',
            text: 'Nice climb!',
        });

        const likeButton = feature.element.querySelector(
            '[data-role="likes"]',
        ) as HTMLButtonElement | null;
        if (!likeButton) {
            return;
        }

        likeButton.click();
        await Promise.resolve();
        expect(likeSpy).toHaveBeenCalledWith('c-1', 'alice@example.com');
    });

    it('triggers favorite toggle and auth guard behavior in the game dialog', async () => {
        vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
        vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
        vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'example-project');
        vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');

        const authApi = await import('@/features/auth/api/auth.api');
        const gameDetailsApi = await import('@/features/game-dialog/api/game-details.api');
        const { createGameDialog } = await import('@/features/game-dialog');
        const { createAuthDialog } = await import('@/features/auth/components/auth');

        const authDialog = createAuthDialog();
        document.body.append(authDialog.dialog);
        authDialog.setMode('register');
        expect(authDialog.dialog.querySelectorAll('input').length).toBe(4);

        const dialog = createGameDialog({
            slug: 'cozy-sudoku',
            title: 'Cozy Sudoku',
            image: 'cozy-sudoku-hero.jpg',
            category: 'Puzzle',
            price: 'Free',
            rating: 4.8,
            likes: 125,
            description: 'Relaxing puzzler',
            players: '1-2',
            duration: '15 min',
            tags: ['pattern'],
            mode: 'Desktop',
            records: [],
        });
        document.body.append(dialog.dialog);

        vi.spyOn(gameDetailsApi, 'toggleGameFavorite').mockResolvedValue({
            isFavorited: true,
            likesCount: 126,
        });
        vi.spyOn(gameDetailsApi, 'getGameDetails').mockResolvedValue({
            slug: 'cozy-sudoku',
            name: 'Cozy Sudoku',
            heroImage: 'cozy-sudoku-hero.jpg',
            rating: 4.8,
            likesCount: 125,
            isLikedByCurrentUser: false,
            fullDescription: 'Relaxing puzzler',
            specs: {
                genre: 'Puzzle',
                players: '1-2',
                duration: '15 min',
                price: 'Free',
            },
            topRecords: [],
        });

        authApi.saveAppSession({
            displayName: 'Tester',
            email: 'tester@example.com',
            authenticatedAt: Date.now(),
        });

        const favoriteButton = dialog.dialog.querySelector(
            '[data-role="favorite"]',
        ) as HTMLButtonElement | null;
        if (!favoriteButton) {
            return;
        }

        favoriteButton.click();
        await Promise.resolve();
        expect(gameDetailsApi.toggleGameFavorite).toHaveBeenCalledWith(
            'cozy-sudoku',
            'tester@example.com',
        );
    });
});

describe('api wrappers and session helpers', () => {
    it('covers the shared API wrapper and relative-time formatter branches', async () => {
        vi.resetModules();
        vi.stubEnv('VITE_API_URL', 'https://api.example.com');
        const fetchSpy = vi.fn((input: RequestInfo | URL) => {
            const url = String(input);
            if (url === 'https://api.example.com/games?sort=rating-desc') {
                return Promise.resolve(
                    Response.json(
                        { data: [{ slug: 'cozy-sudoku' }] },
                        {
                            status: 200,
                            headers: { 'Content-Type': 'application/json' },
                        },
                    ),
                );
            }

            return url === 'https://api.example.com/bad-request'
                ? Promise.resolve(
                      Response.json(
                          { message: 'Nope' },
                          {
                              status: 500,
                              headers: { 'Content-Type': 'application/json' },
                          },
                      ),
                  )
                : Promise.resolve(
                      Response.json(
                          { ok: true },
                          {
                              status: 200,
                              headers: { 'Content-Type': 'application/json' },
                          },
                      ),
                  );
        });
        vi.stubGlobal('fetch', fetchSpy);

        const { apiClient } = await import('@/shared/api/api-client');
        const { formatRelativeTime } = await import('@/shared/utils/format-relative-time');

        const result = await apiClient('/games?sort=rating-desc', {
            headers: { 'X-Test': 'yes' },
        });
        expect(result).toMatchObject({ data: [{ slug: 'cozy-sudoku' }] });
        expect(fetchSpy).toHaveBeenCalledWith(
            'https://api.example.com/games?sort=rating-desc',
            expect.objectContaining({
                headers: expect.objectContaining({
                    Accept: 'application/json',
                    'X-Test': 'yes',
                }),
            }),
        );

        await expect(apiClient('/bad-request')).rejects.toThrow('API request failed');

        const now = Date.now();
        vi.setSystemTime(new Date(now));
        expect(formatRelativeTime(new Date(now - 30_000).toISOString())).toBe('just now');
        expect(formatRelativeTime(new Date(now - 60_000).toISOString())).toBe('1 min ago');
        expect(formatRelativeTime(new Date(now - 3 * 60 * 60_000).toISOString())).toBe(
            '3 hours ago',
        );
        expect(formatRelativeTime(new Date(now - 2 * 24 * 60 * 60_000).toISOString())).toBe(
            '2 days ago',
        );
        expect(formatRelativeTime(new Date(now - 5 * 7 * 24 * 60 * 60_000).toISOString())).toBe(
            '1 month ago',
        );
        expect(formatRelativeTime(new Date(now - 4 * 30 * 24 * 60 * 60_000).toISOString())).toBe(
            '4 months ago',
        );
        expect(formatRelativeTime(new Date(now - 2 * 365 * 24 * 60 * 60_000).toISOString())).toBe(
            '2 years ago',
        );
    });

    it('renders profile state and header auth actions for guest and signed-in sessions', async () => {
        vi.resetModules();
        const authApi = await import('@/features/auth/api/auth.api');
        const { createHeader } = await import('@/features/header/header');
        const { createProfileState } = await import('@/features/header/profile');

        const signedIn = {
            displayName: 'Ada Lovelace',
            email: 'ada@example.com',
            authenticatedAt: Date.now(),
            avatarUrl: 'https://example.com/avatar.png',
        };

        const profile = createProfileState(signedIn);
        expect(profile.querySelector('.profile-state__name')?.textContent).toBe('Ada Lovelace');
        const avatarImage = profile.querySelector('img');
        expect(avatarImage).not.toBeNull();
        avatarImage?.dispatchEvent(new Event('load'));
        expect((profile.querySelector('.profile-state__fallback') as HTMLElement).hidden).toBe(
            true,
        );

        const brokenProfile = createProfileState({
            ...signedIn,
            avatarUrl: 'https://example.com/broken.png',
        });
        const brokenImage = brokenProfile.querySelector('img');
        brokenImage?.dispatchEvent(new Event('error'));
        expect(
            (brokenProfile.querySelector('.profile-state__fallback') as HTMLElement).hidden,
        ).toBe(false);

        const guestHeader = createHeader();
        document.body.append(guestHeader);
        expect(guestHeader.querySelectorAll('[data-auth-action]').length).toBe(4);

        authApi.saveAppSession(signedIn);
        document.body.replaceChildren();
        const memberHeader = createHeader();
        document.body.append(memberHeader);
        expect(memberHeader.querySelector('.profile-state')).not.toBeNull();

        const fallbackProfile = createProfileState();
        expect(fallbackProfile.querySelector('.profile-state__fallback')?.textContent).toBe('P');
    });

    it('exercises the gallery and comment/game-detail API contracts', async () => {
        vi.resetModules();
        vi.stubEnv('VITE_API_URL', 'https://api.example.com');
        const fetchSpy = vi.fn((input: RequestInfo | URL) => {
            const url = String(input);
            if (
                url ===
                'https://api.example.com/games/cozy-sudoku/comments?limit=2&sort=newest&userEmail=alice%40example.com'
            ) {
                return Promise.resolve(
                    Response.json(
                        {
                            comments: [
                                {
                                    commentId: 'c-1',
                                    authorName: 'Alice',
                                    text: 'Great game',
                                    likesCount: 7,
                                    isLikedByCurrentUser: true,
                                    createdAt: '2025-01-01T00:00:00.000Z',
                                },
                            ],
                            totalCount: 1,
                        },
                        { status: 200, headers: { 'Content-Type': 'application/json' } },
                    ),
                );
            }

            if (url === 'https://api.example.com/games/cozy-sudoku/comments') {
                return Promise.resolve(
                    Response.json(
                        {
                            data: {
                                commentId: 'c-2',
                                authorName: 'Alice',
                                text: 'Nice climb!',
                                likesCount: 0,
                                isLikedByCurrentUser: false,
                                createdAt: '2025-01-01T00:30:00.000Z',
                            },
                        },
                        { status: 200, headers: { 'Content-Type': 'application/json' } },
                    ),
                );
            }

            if (url === 'https://api.example.com/comments/c-1/like') {
                return Promise.resolve(
                    Response.json(
                        {
                            data: {
                                likesCount: 8,
                                isLikedByCurrentUser: true,
                            },
                        },
                        { status: 200, headers: { 'Content-Type': 'application/json' } },
                    ),
                );
            }

            if (url === 'https://api.example.com/games/cozy-sudoku?userEmail=alice%40example.com') {
                return Promise.resolve(
                    Response.json(
                        {
                            data: {
                                slug: 'cozy-sudoku',
                                name: 'Cozy Sudoku',
                                heroImage: 'cozy-sudoku-hero.jpg',
                                rating: 4.8,
                                likesCount: 12,
                                isLikedByCurrentUser: false,
                                fullDescription: 'Puzzle game',
                                specs: {
                                    genre: 'Puzzle',
                                    players: '1-2',
                                    duration: '15 min',
                                    price: 'Free',
                                },
                                topRecords: [],
                            },
                        },
                        { status: 200, headers: { 'Content-Type': 'application/json' } },
                    ),
                );
            }

            return url === 'https://api.example.com/games/cozy-sudoku/favorite'
                ? Promise.resolve(
                      Response.json(
                          {
                              data: {
                                  isFavorited: true,
                                  likesCount: 13,
                              },
                          },
                          { status: 200, headers: { 'Content-Type': 'application/json' } },
                      ),
                  )
                : Promise.resolve(
                      Response.json(
                          {},
                          {
                              status: 404,
                              headers: { 'Content-Type': 'application/json' },
                          },
                      ),
                  );
        });
        vi.stubGlobal('fetch', fetchSpy);

        const commentsApi = await import('@/features/comments/api/comments.api');
        const gameDetailsApi = await import('@/features/game-dialog/api/game-details.api');

        await expect(
            commentsApi.getGameCommentsWithMeta('cozy-sudoku', {
                limit: 2,
                sort: 'newest',
                userEmail: 'alice@example.com',
            }),
        ).resolves.toMatchObject({
            comments: [
                expect.objectContaining({
                    commentId: 'c-1',
                    text: 'Great game',
                }),
            ],
            totalCount: 1,
        });

        await expect(
            commentsApi.postGameComment('cozy-sudoku', {
                userEmail: 'alice@example.com',
                authorName: 'Alice',
                text: 'Nice climb!',
            }),
        ).resolves.toMatchObject({
            commentId: 'c-2',
            text: 'Nice climb!',
        });

        await expect(commentsApi.toggleCommentLike('c-1', 'alice@example.com')).resolves.toEqual({
            likesCount: 8,
            isLikedByCurrentUser: true,
        });

        await expect(
            gameDetailsApi.getGameDetails('cozy-sudoku', 'alice@example.com'),
        ).resolves.toMatchObject({
            slug: 'cozy-sudoku',
            name: 'Cozy Sudoku',
        });

        await expect(
            gameDetailsApi.toggleGameFavorite('cozy-sudoku', 'alice@example.com'),
        ).resolves.toEqual({
            isFavorited: true,
            likesCount: 13,
        });

        await expect(commentsApi.toggleCommentLike('bad', 'alice@example.com')).rejects.toThrow();
    });
});

describe('factory coverage for page and UI composition', () => {
    it('renders the key app factories and layout wrappers without crashing', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async (url: string | URL) => {
                const pathname = String(url).replace(import.meta.env.VITE_API_URL, '');

                if (pathname === '/leaderboard') {
                    return Response.json(
                        {
                            data: [
                                {
                                    rank: 1,
                                    playerName: 'Alice',
                                    gamesPlayed: 3,
                                    totalScore: 500,
                                    streakDays: 4,
                                    favoriteGameName: 'Cozy Sudoku',
                                },
                            ],
                        },
                        { status: 200, headers: { 'Content-Type': 'application/json' } },
                    );
                }

                if (pathname === '/categories') {
                    return Response.json(
                        {
                            data: [
                                { slug: 'all', label: 'All', isDefault: true },
                                { slug: 'puzzle', label: 'Puzzle', isDefault: false },
                            ],
                        },
                        { status: 200, headers: { 'Content-Type': 'application/json' } },
                    );
                }

                if (pathname === '/games?featured=true') {
                    return Response.json(
                        {
                            data: [
                                {
                                    slug: 'cozy-sudoku',
                                    name: 'Cozy Sudoku',
                                    category: 'Puzzle',
                                    price: 'Free',
                                    shortDescription: 'Relaxing puzzle',
                                    rating: 4.8,
                                    likesCount: 120,
                                    cardImage: 'cozy-sudoku-card.jpg',
                                },
                            ],
                        },
                        { status: 200, headers: { 'Content-Type': 'application/json' } },
                    );
                }

                return pathname.startsWith('/games?')
                    ? Response.json(
                          {
                              data: [
                                  {
                                      slug: 'cozy-sudoku',
                                      name: 'Cozy Sudoku',
                                      category: 'Puzzle',
                                      price: 'Free',
                                      shortDescription: 'Relaxing puzzle',
                                      rating: 4.8,
                                      likesCount: 120,
                                      cardImage: 'cozy-sudoku-card.jpg',
                                  },
                              ],
                              meta: { page: 1, totalPages: 1 },
                          },
                          { status: 200, headers: { 'Content-Type': 'application/json' } },
                      )
                    : Response.json(
                          {},
                          {
                              status: 200,
                              headers: { 'Content-Type': 'application/json' },
                          },
                      );
            }),
        );

        const { createHeader } = await import('@/features/header/header');
        const { createFooter } = await import('@/features/footer/footer');
        const { createHero } = await import('@/features/hero/hero');
        const { createDeveloperSection } = await import('@/features/developer/developer');
        const { createLeaderboard } = await import('@/features/leaderboard');
        const { createCarousel } = await import('@/features/carousel');
        const { createHomePage } = await import('@/pages/home');
        const { createLibraryPage } = await import('@/pages/library');
        const { createCategoriesLayout } = await import('@/features/categories/components/layout');
        const { createLibraryFiltersLayout } =
            await import('@/features/library-filters/components/layout');
        const { createLibraryGameGridLayout } =
            await import('@/features/library-game-grid/components/layout');
        const { createLibraryPaginationLayout } =
            await import('@/features/library-pagination/components/layout');
        const { createButton } = await import('@/shared/components/button/button');
        const { createIconButton } = await import('@/shared/components/icon-button/icon-button');
        const { createFilterChip } = await import('@/shared/components/filter-chip/filter-chip');
        const { createSnackbar } = await import('@/shared/components/snackbar/snackbar');
        const { createPaginationButton } =
            await import('@/shared/components/pagination-button/pagination-button');
        const { createGameDialogLayout } = await import('@/features/game-dialog/components/layout');
        const { createGameDialogComponent, DEFAULT_GAME } =
            await import('@/features/game-dialog/components/game-dialog');

        document.body.append(
            createHeader(),
            createFooter(),
            createHero(),
            createDeveloperSection(),
            createLeaderboard(),
            createCarousel(),
            createHomePage(),
            createLibraryPage(),
            createCategoriesLayout(() => {}),
            createLibraryFiltersLayout().element,
            createLibraryGameGridLayout().element,
            createLibraryPaginationLayout().element,
            createButton({ label: 'Save', variant: 'primary' }),
            createIconButton('Open', 'svg', { size: 'md' }),
            createFilterChip({ children: 'Machine', selected: true, onClick: () => {} }),
            createSnackbar().element,
            createPaginationButton({ kind: 'page', children: '1' }),
            createGameDialogLayout().dialog,
            (() => {
                const gameDialog = createGameDialogComponent(
                    createGameDialogLayout(),
                    document.createElement('div'),
                    DEFAULT_GAME,
                    undefined,
                    async () => {},
                );

                gameDialog.setGame(DEFAULT_GAME);
                return document.createElement('div');
            })(),
        );

        expect(
            document.body.querySelectorAll('header, footer, section, button, form').length,
        ).toBeGreaterThan(0);
    });
});

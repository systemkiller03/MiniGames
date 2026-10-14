import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const categories = [
    { slug: 'all', label: 'All games', isDefault: true },
    { slug: 'cozy-puzzle', label: 'Cozy puzzle', isDefault: false },
];
const game = {
    slug: 'tiny-glade',
    name: 'Tiny Glade',
    category: 'cozy-puzzle',
    price: 'Free',
    shortDescription: 'Build a village.',
    rating: 4.7,
    likesCount: 1400,
    cardImage: 'tiny-glade-card.jpg',
};
const details = {
    slug: 'tiny-glade',
    name: 'Tiny Glade',
    heroImage: 'tiny-glade-hero.jpg',
    rating: 4.7,
    likesCount: 1400,
    isLikedByCurrentUser: false,
    fullDescription: 'Build a cozy village.',
    specs: { genre: 'Puzzle', players: 'Solo', duration: '15 min', price: 'Free' },
    topRecords: [],
};

beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'library-test');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
    localStorage.clear();
    document.body.replaceChildren();
    globalThis.history.replaceState(undefined, '', '/MiniGames/?route=%2Flibrary');
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    document.body.replaceChildren();
});

describe('createLibrary', () => {
    it('loads categories and games, syncs filters and pagination to the URL, and opens selected details', async () => {
        const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
            const url = String(input);
            if (url.endsWith('/categories')) {
                return Response.json({ data: categories });
            }
            if (url.includes('/games/tiny-glade')) {
                return Response.json({ data: details });
            }
            if (url.includes('/comments')) {
                return Response.json({ comments: [], totalCount: 0 });
            }
            const page = Number(new URL(url).searchParams.get('page'));
            return Response.json({ data: [game], meta: { page, totalPages: 2 } });
        });
        vi.stubGlobal('fetch', fetchMock);
        const { createLibraryFiltersLayout } =
            await import('@/features/library-filters/components/layout');
        const { createLibraryGameGridLayout } =
            await import('@/features/library-game-grid/components/layout');
        const { createLibraryPaginationLayout } =
            await import('@/features/library-pagination/components/layout');
        const { createLibrary } = await import('./layout');
        const filters = createLibraryFiltersLayout();
        const grid = createLibraryGameGridLayout();
        const pagination = createLibraryPaginationLayout();
        document.body.append(createLibrary({ filters, gameGrid: grid, pagination }));

        await vi.waitFor(() => {
            expect(grid.element.dataset.state).toBe('ready');
            expect(grid.element.textContent).toContain('Tiny Glade');
        });
        expect(filters.categories.dataset.state).toBe('ready');
        expect(filters.categories.querySelectorAll('button')).toHaveLength(2);
        expect(filters.categories.querySelector('button')?.getAttribute('aria-pressed')).toBe(
            'true',
        );
        expect(String(fetchMock.mock.calls[1]?.[0])).toContain(
            'category=all&sort=rating-desc&page=1&limit=6',
        );

        filters.categories.querySelectorAll('button')[1]?.click();
        await vi.waitFor(() => {
            expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain('category=cozy-puzzle');
        });
        filters.element.querySelector<HTMLButtonElement>('.sort-dropdown__trigger')?.click();
        filters.element.querySelector<HTMLElement>('[data-sort-key="name-asc"]')?.click();
        await vi.waitFor(() => {
            expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain('sort=name-asc');
        });
        pagination.element.querySelector<HTMLButtonElement>('[data-kind="next"]')?.click();
        await vi.waitFor(() => {
            expect(String(fetchMock.mock.calls.at(-1)?.[0])).toContain('page=2');
        });
        await vi.waitFor(() => {
            expect(grid.element.dataset.state).toBe('ready');
        });
        expect(new URL(globalThis.location.href).searchParams.get('page')).toBe('2');

        grid.element.querySelector<HTMLButtonElement>('[data-role="details"]')?.click();
        expect(new URL(globalThis.location.href).searchParams.get('game')).toBe('tiny-glade');
        expect(
            fetchMock.mock.calls.some(([input]) => String(input).includes('/games/tiny-glade')),
        ).toBe(true);
        await vi.waitFor(() => {
            expect(
                document.body.querySelector<HTMLDialogElement>('.game-dialog')?.textContent,
            ).toContain('Build a cozy village.');
        });
        expect(new URL(globalThis.location.href).searchParams.get('game')).toBe('tiny-glade');
    });

    it('shows category errors and retries category loading before refreshing games', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(new Response('', { status: 503 }))
            .mockResolvedValueOnce(Response.json({ data: [], meta: { page: 1, totalPages: 1 } }))
            .mockResolvedValueOnce(Response.json({ data: categories }))
            .mockResolvedValueOnce(Response.json({ data: [], meta: { page: 1, totalPages: 1 } }));
        vi.stubGlobal('fetch', fetchMock);
        const { createLibraryFiltersLayout } =
            await import('@/features/library-filters/components/layout');
        const { createLibraryGameGridLayout } =
            await import('@/features/library-game-grid/components/layout');
        const { createLibraryPaginationLayout } =
            await import('@/features/library-pagination/components/layout');
        const { createLibrary } = await import('./layout');
        const filters = createLibraryFiltersLayout();
        const grid = createLibraryGameGridLayout();
        document.body.append(
            createLibrary({ filters, gameGrid: grid, pagination: createLibraryPaginationLayout() }),
        );
        await vi.waitFor(() => {
            expect(filters.categories.dataset.state).toBe('error');
        });
        expect(document.body.textContent).toContain('Unable to load categories');
        filters.categories.querySelector('button')?.click();
        await vi.waitFor(() => {
            expect(filters.categories.dataset.state).toBe('ready');
            expect(grid.element.dataset.state).toBe('empty');
        });
        expect(fetchMock).toHaveBeenCalledTimes(4);
    });

    it('renders a game error and retries with the same request state', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(Response.json({ data: categories }))
            .mockResolvedValueOnce(new Response('', { status: 500 }))
            .mockResolvedValueOnce(
                Response.json({ data: [game], meta: { page: 1, totalPages: 1 } }),
            );
        vi.stubGlobal('fetch', fetchMock);
        const { createLibraryFiltersLayout } =
            await import('@/features/library-filters/components/layout');
        const { createLibraryGameGridLayout } =
            await import('@/features/library-game-grid/components/layout');
        const { createLibraryPaginationLayout } =
            await import('@/features/library-pagination/components/layout');
        const { createLibrary } = await import('./layout');
        const filters = createLibraryFiltersLayout();
        const grid = createLibraryGameGridLayout();
        document.body.append(
            createLibrary({ filters, gameGrid: grid, pagination: createLibraryPaginationLayout() }),
        );

        await vi.waitFor(() => {
            expect(grid.element.dataset.state).toBe('error');
        });
        expect(document.body.textContent).toContain('Unable to load games');
        grid.element.querySelector('button')?.click();
        await vi.waitFor(() => {
            expect(grid.element.dataset.state).toBe('ready');
            expect(grid.element.textContent).toContain('Tiny Glade');
        });
    });
});

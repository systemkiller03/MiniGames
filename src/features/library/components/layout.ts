import { getLibraryCategories } from '@/features/categories/components/layout';
import type { ApiLibraryCategory } from '@/features/categories/components/layout';
import { getLibraryGames, type ApiLibraryGame, type ApiLibraryGamesPage } from '../api/library.api';
import { createLibraryLayout } from './library-view';
import type { LibrarySortKey } from '@/features/library-filters/components/layout';
import type { LibraryFiltersLayout } from '@/features/library-filters/components/layout';
import type { LibraryGameGridLayout } from '@/features/library-game-grid/components/layout';
import type { LibraryPaginationLayout } from '@/features/library-pagination/components/layout';
import type { GameDialogData } from '@/features/game-dialog';
import type { LibraryGameCard } from '@/features/library-game-grid/components/layout';
import { getCardImage as getLocalCardImage } from '@/shared/utils/game-images';
import { readRouteState, updateRouteState } from '@/shared/utils/navigation';

type LibraryState = {
    categories: ApiLibraryCategory[];
    category: string;
    games: ApiLibraryGame[];
    page: number;
    totalPages: number;
    status: 'loading' | 'ready' | 'empty' | 'error';
    sortKey: LibrarySortKey;
};

function toTitleCase(value: string): string {
    return value
        .split(/[-\s]+/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
}

function toLibraryGameCard(game: ApiLibraryGame): LibraryGameCard {
    let image = getLocalCardImage(game.cardImage);
    if (!image) {
        try {
            image = new URL(game.cardImage, import.meta.env.VITE_API_URL).href;
        } catch {
            image = game.cardImage;
        }
    }

    const category = toTitleCase(game.category);
    return {
        imgSrc: image,
        name: game.name,
        description: game.shortDescription,
        category,
        cost: game.price,
        stars: Number(game.rating),
        likes: Number(game.likesCount),
        dialogData: {
            slug: game.slug,
            image,
            title: game.name,
            category,
            price: game.price,
            rating: Number(game.rating),
            likes: Number(game.likesCount),
            description: game.shortDescription,
            tags: [],
            players: 'Solo',
            duration: '40-90 min',
            mode: 'Desktop',
        } satisfies GameDialogData,
    };
}

export function createLibrary({
    filters,
    gameGrid,
    pagination,
}: {
    filters: LibraryFiltersLayout;
    gameGrid: LibraryGameGridLayout;
    pagination: LibraryPaginationLayout;
}): DocumentFragment {
    const initialRoute = readRouteState();
    const state: LibraryState = {
        categories: [],
        category: initialRoute.category ?? 'all',
        games: [],
        page: initialRoute.pageNumber ?? 1,
        totalPages: 1,
        status: 'loading',
        sortKey: (initialRoute.sort as LibrarySortKey) ?? 'rating-desc',
    };

    let gamesRequestId = 0;
    const layout = createLibraryLayout(
        filters,
        gameGrid,
        pagination,
        (sortKey) => {
            state.sortKey = sortKey;
            resetPageAndLoad();
        },
        (category) => {
            state.category = category;
            renderCategories();
            resetPageAndLoad();
        },
        (page) => {
            state.page = page;
            updateRouteState({
                page: '/library',
                category: state.category,
                sort: state.sortKey,
                pageNumber: state.page,
            });
            void loadGames(page);
        },
    );

    function showSnackbar(message: string): void {
        layout.snackbar.show(message, 'error');
    }

    function syncRoute(isReplace = false): void {
        updateRouteState(
            {
                page: '/library',
                category: state.category,
                sort: state.sortKey,
                pageNumber: state.page,
            },
            isReplace,
        );
    }

    function resetPageAndLoad(): void {
        state.page = 1;
        syncRoute();
        layout.pagination.update(state.totalPages, state.page);
        void loadGames(1);
    }

    function renderCategories(): void {
        layout.filters.setCategories(state.categories, state.category);
    }

    function renderGames(): void {
        layout.gameGrid.setGames(
            state.games.map((game) => toLibraryGameCard(game)),
            (game) => {
                layout.previewDialog.setGame(game);
                void layout.previewDialog.open();
            },
        );

        const routeState = readRouteState();
        if (!routeState.game) {
            return;
        }

        layout.previewDialog.setGame({
            slug: routeState.game,
            image: '',
            title: routeState.game,
            category: '',
            price: '',
            rating: 0,
            likes: 0,
            description: '',
            tags: [],
            players: '',
            duration: '',
            mode: 'Desktop',
        });
        void layout.previewDialog.open();
    }

    async function loadCategories(): Promise<void> {
        layout.filters.setLoading();

        try {
            const categories = await getLibraryCategories();
            state.categories = categories;
            const routeCategory = categories.find(
                (category) => category.slug === initialRoute.category,
            );
            state.category =
                routeCategory?.slug ??
                categories.find((category) => category.isDefault)?.slug ??
                'all';
            renderCategories();
        } catch {
            layout.filters.setError(() => {
                void loadCategories().then(() => {
                    if (layout.filters.categories.dataset.state === 'ready') {
                        resetPageAndLoad();
                    }
                });
            });
            showSnackbar('Unable to load categories. Please try again.');
        }
    }

    async function loadGames(page = state.page): Promise<void> {
        const requestId = ++gamesRequestId;
        state.status = 'loading';
        layout.gameGrid.setLoading();

        try {
            const response: ApiLibraryGamesPage = await getLibraryGames({
                category: state.category,
                sort: state.sortKey,
                page,
                limit: 6,
            });

            if (requestId !== gamesRequestId) {
                return;
            }

            state.games = response.data;
            state.page = response.page;
            state.totalPages = response.totalPages;
            if (response.page !== page) {
                syncRoute(true);
            }
            layout.pagination.update(state.totalPages, state.page);

            if (state.games.length === 0) {
                state.status = 'empty';
                layout.gameGrid.setEmpty();
                return;
            }

            state.status = 'ready';
            renderGames();
        } catch {
            if (requestId !== gamesRequestId) {
                return;
            }

            state.status = 'error';
            layout.pagination.update(state.totalPages, state.page);
            layout.gameGrid.setError(() => void loadGames());
            showSnackbar('Unable to load games. Please try again.');
        }
    }

    void (async () => {
        await loadCategories();
        await loadGames();
    })();

    return layout.element;
}

import './styles/library.scss';
import { createCategories } from '@/features/categories/categories';
import {
    getLibraryCategories,
    getLibraryGames,
    type ApiLibraryCategory,
    type ApiLibraryGame,
    type ApiLibraryGamesPage,
} from './api/library.api';
import { createEmptyState } from './components/empty';
import { createErrorState } from './components/error';
import { renderGameList } from './components/game-list';
import { createLibraryLayout } from './components/layout';
import { createLoadingState } from './components/loading';
import type { LibrarySortKey } from '@/features/sort-dropdown/sort-dropdown';

type LibraryState = {
    categories: ApiLibraryCategory[];
    category: string;
    games: ApiLibraryGame[];
    page: number;
    totalPages: number;
    status: 'loading' | 'ready' | 'empty' | 'error';
    sortKey: LibrarySortKey;
};

export function createLibrary(): DocumentFragment {
    const state: LibraryState = {
        categories: [],
        category: 'all',
        games: [],
        page: 1,
        totalPages: 1,
        status: 'loading',
        sortKey: 'rating-desc',
    };

    let gamesRequestId = 0;
    const layout = createLibraryLayout(
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
            void loadGames(page);
        },
    );

    let snackbarTimer: number | undefined;

    function showSnackbar(message: string): void {
        layout.snackbar.textContent = message;
        layout.snackbar.dataset.variant = 'error';
        layout.snackbar.classList.add('is-visible');
        if (snackbarTimer !== undefined) globalThis.clearTimeout(snackbarTimer);
        snackbarTimer = globalThis.setTimeout(() => {
            layout.snackbar.classList.remove('is-visible');
        }, 3200);
    }

    function resetPageAndLoad(): void {
        state.page = 1;
        layout.pagination.update(state.totalPages, state.page);
        void loadGames(1);
    }

    function renderCategories(): void {
        if (state.categories.length === 0) {
            return;
        }

        layout.categories.replaceChildren(
            createCategories(state.categories, state.category, (category) => {
                if (state.category === category) {
                    return;
                }
                state.category = category;
                renderCategories();
                resetPageAndLoad();
            }),
        );
    }

    function renderGames(): void {
        renderGameList(layout.gameCards, state.games, (game) => {
            layout.previewDialog.setGame(game);
            layout.previewDialog.open();
        });
        layout.gameCards.dataset.state = 'ready';
    }

    async function loadCategories(): Promise<void> {
        try {
            const categories = await getLibraryCategories();
            state.categories = categories;
            state.category = categories.find((category) => category.isDefault)?.slug ?? 'all';
            renderCategories();
        } catch {
            showSnackbar('Unable to load categories. Please try again.');
        }
    }

    async function loadGames(page = state.page): Promise<void> {
        const requestId = ++gamesRequestId;
        state.status = 'loading';
        layout.gameCards.dataset.state = 'loading';
        layout.gameCards.replaceChildren(createLoadingState());

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
            layout.pagination.update(state.totalPages, state.page);

            if (state.games.length === 0) {
                state.status = 'empty';
                layout.gameCards.dataset.state = 'empty';
                layout.gameCards.replaceChildren(createEmptyState());
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
            layout.gameCards.dataset.state = 'error';
            layout.gameCards.replaceChildren(createErrorState(() => void loadGames()));
            showSnackbar('Unable to load games. Please try again.');
        }
    }

    void (async () => {
        await loadCategories();
        await loadGames();
    })();

    return layout.element;
}

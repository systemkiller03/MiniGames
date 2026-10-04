import './styles/library.scss';
import { createCategories } from '@/features/categories/categories';
import {
    getLibraryCategories,
    getLibraryGames,
    type ApiLibraryCategory,
    type ApiLibraryGame,
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
    status: 'loading' | 'ready' | 'empty' | 'error';
    sortKey: LibrarySortKey;
};

export function createLibrary(): DocumentFragment {
    const state: LibraryState = {
        categories: [],
        category: 'all',
        games: [],
        status: 'loading',
        sortKey: 'rating-desc',
    };

    const layout = createLibraryLayout(
        (sortKey) => {
            state.sortKey = sortKey;
            void loadGames();
        },
        (category) => {
            state.category = category;
            renderCategories();
            void loadGames();
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
                void loadGames();
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

    async function loadGames(): Promise<void> {
        state.status = 'loading';
        layout.gameCards.dataset.state = 'loading';
        layout.gameCards.replaceChildren(createLoadingState());

        try {
            state.games = await getLibraryGames({
                category: state.category,
                sort: state.sortKey,
                page: 1,
                limit: 6,
            });

            if (state.games.length === 0) {
                state.status = 'empty';
                layout.gameCards.dataset.state = 'empty';
                layout.gameCards.replaceChildren(createEmptyState());
                return;
            }

            state.status = 'ready';
            renderGames();
        } catch {
            state.status = 'error';
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

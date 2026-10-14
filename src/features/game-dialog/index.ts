import './styles/game-dialog.scss';
import { createComments } from '@/features/comments/components/layout';
import { createSnackbar } from '@/shared/components';
import { formatRelativeTime } from '@/shared/utils/format-relative-time';
import { getGameDetails, toggleGameFavorite, type ApiGameDetails } from './api/game-details.api';
import { createEmptyState } from './components/empty';
import { createErrorState } from './components/error';
import {
    createGameDialogComponent,
    DEFAULT_GAME,
    type GameDialogData,
    type GameRecord,
} from './components/game-dialog';
import { createGameDialogLayout } from './components/layout';
import { createLoadingState } from './components/loading';
import { getHeroImage } from '@/shared/utils/game-images';
import { readRouteState, updateRouteState } from '@/shared/utils/navigation';
import { getAppSession } from '@/features/auth/api/auth.api';

export type { GameDialogData } from './components/game-dialog';

function mapGameDetailsToRecord(detail: ApiGameDetails): GameRecord[] {
    return detail.topRecords.map((record) => {
        let medal = '🥉';
        if (record.position === 1) {
            medal = '🥇';
        } else if (record.position === 2) {
            medal = '🥈';
        }
        return {
            medal,
            name: record.playerName,
            score: `${record.score.toLocaleString()} pts`,
            time: formatRelativeTime(record.achievedAt),
        };
    });
}

function closeDialogAndRevertRoute(): void {
    const routeState = readRouteState();
    updateRouteState({
        page: routeState.page,
        category: routeState.category,
        sort: routeState.sort,
        pageNumber: routeState.pageNumber,
        game: undefined,
        auth: undefined,
    });
}

export function createGameDialog(initialGame: GameDialogData = DEFAULT_GAME): {
    dialog: HTMLDialogElement;
    setGame: (game: GameDialogData) => void;
    open: () => Promise<void>;
    close: () => void;
} {
    let shouldSkipRouteCleanupOnClose = false;
    let isWaitingForAuth = false;
    let isFavoriteRequestInFlight = false;
    let favoriteState = { pressed: false, count: initialGame.likes };
    const favoriteSnackbar = createSnackbar();
    document.body.append(favoriteSnackbar.element);

    const layout = createGameDialogLayout(() => {
        if (!shouldSkipRouteCleanupOnClose) {
            closeDialogAndRevertRoute();
        }
    });
    let currentGame = initialGame;
    let detailsRequestId = 0;

    const canPerformProtectedAction = (
        reason: 'favorite' | 'comment-like' = 'favorite',
    ): boolean => {
        if (getAppSession()) {
            return true;
        }

        if (!isWaitingForAuth) {
            isWaitingForAuth = true;
            const routeState = readRouteState();
            shouldSkipRouteCleanupOnClose = true;
            if (layout.dialog.open) {
                layout.dialog.close();
            } else {
                shouldSkipRouteCleanupOnClose = false;
            }
            updateRouteState({
                page: routeState.page,
                category: routeState.category,
                sort: routeState.sort,
                pageNumber: routeState.pageNumber,
                game: currentGame.slug ?? routeState.game,
                auth: 'login',
            });
            globalThis.dispatchEvent(new CustomEvent('app-auth-required', { detail: { reason } }));
        }
        return false;
    };

    const comments = createComments(canPerformProtectedAction);
    const component = createGameDialogComponent(
        layout,
        comments.element,
        initialGame,
        canPerformProtectedAction,
        async () => {
            if (isFavoriteRequestInFlight) {
                return;
            }

            const session = getAppSession();
            if (!session) {
                canPerformProtectedAction();
                return;
            }

            const slug = currentGame.slug ?? DEFAULT_GAME.slug;
            if (!slug) {
                return;
            }

            isFavoriteRequestInFlight = true;
            component.setFavoriteButtonState({
                pressed: favoriteState.pressed,
                count: favoriteState.count,
                loading: true,
                disabled: true,
            });

            try {
                const result = await toggleGameFavorite(slug, session.email);
                favoriteState = {
                    pressed: result.isFavorited,
                    count: result.likesCount,
                };
                currentGame = {
                    ...currentGame,
                    likes: result.likesCount,
                };
                component.setFavoriteButtonState({
                    pressed: result.isFavorited,
                    count: result.likesCount,
                    disabled: false,
                    loading: false,
                });
                component.setGame({
                    ...currentGame,
                    likes: result.likesCount,
                });
            } catch {
                favoriteSnackbar.show(
                    'Unable to update favorites right now. Please try again.',
                    'error',
                );
                component.setFavoriteButtonState({
                    pressed: favoriteState.pressed,
                    count: favoriteState.count,
                    disabled: false,
                    loading: false,
                });
            } finally {
                isFavoriteRequestInFlight = false;
            }
        },
    );
    globalThis.addEventListener('app-session-updated', () => {
        if (!layout.dialog.open) {
            return;
        }

        component.resetUserState();
        component.setFavoriteButtonState({
            pressed: false,
            count: currentGame.likes,
            disabled: false,
            loading: false,
        });
        void comments.load(currentGame.slug ?? DEFAULT_GAME.slug ?? '');
        void loadGameDetails();
    });

    const setGame = (game: GameDialogData): void => {
        currentGame = game;
        component.setGame(game);
    };

    const loadGameDetails = async (): Promise<void> => {
        const slug = currentGame.slug ?? DEFAULT_GAME.slug;
        detailsRequestId += 1;

        if (!slug) {
            setGame(currentGame);
            return;
        }

        const requestId = detailsRequestId;
        layout.setContent(createLoadingState());
        let detail: ApiGameDetails;
        try {
            detail = await getGameDetails(slug, getAppSession()?.email);
        } catch {
            if (requestId === detailsRequestId) {
                layout.setContent(createErrorState(() => void loadGameDetails()));
            }
            return;
        }

        if (requestId !== detailsRequestId) {
            return;
        }

        if (!detail.name) {
            layout.setContent(createEmptyState('This game is not available right now.'));
            return;
        }

        const nextFavoriteState = {
            pressed: detail.isLikedByCurrentUser,
            count: detail.likesCount,
        };
        favoriteState = nextFavoriteState;
        setGame({
            slug,
            image: getHeroImage(slug, currentGame.image),
            title: detail.name,
            category: detail.specs.genre,
            price: detail.specs.price,
            rating: detail.rating,
            likes: detail.likesCount,
            description: detail.fullDescription,
            players: detail.specs.players,
            duration: detail.specs.duration,
            tags: [],
            mode: 'Desktop',
            records: mapGameDetailsToRecord(detail),
        });
        component.setFavoriteButtonState({
            pressed: detail.isLikedByCurrentUser,
            count: detail.likesCount,
            disabled: false,
            loading: false,
        });
        void comments.load(slug);
    };

    const open = async (): Promise<void> => {
        getAppSession();
        if (!layout.dialog.open) {
            if (typeof layout.dialog.showModal === 'function') {
                layout.dialog.showModal();
            } else {
                layout.dialog.setAttribute('open', 'open');
            }
        }

        const routeState = readRouteState();
        if (routeState.game !== currentGame.slug || routeState.auth) {
            updateRouteState({
                page: routeState.page,
                category: routeState.category,
                sort: routeState.sort,
                pageNumber: routeState.pageNumber,
                game: currentGame.slug ?? undefined,
                auth: undefined,
            });
        }

        await loadGameDetails();
    };

    layout.dialog.addEventListener('close', () => {
        if (shouldSkipRouteCleanupOnClose) {
            shouldSkipRouteCleanupOnClose = false;
            return;
        }
        closeDialogAndRevertRoute();
    });
    globalThis.addEventListener('app-auth-completed', () => {
        if (!isWaitingForAuth) {
            return;
        }
        isWaitingForAuth = false;
        if (layout.dialog.isConnected) {
            void open();
        }
    });

    return {
        dialog: layout.dialog,
        setGame,
        open,
        close: () => {
            layout.dialog.close();
        },
    };
}

import './styles/game-dialog.scss';
import { createComments } from '@/features/comments/components/layout';
import { formatRelativeTime } from '@/shared/utils/format-relative-time';
import { getGameDetails, type ApiGameDetails } from './api/game-details.api';
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
    const layout = createGameDialogLayout(closeDialogAndRevertRoute);
    const comments = createComments();
    const component = createGameDialogComponent(layout, comments.element, initialGame);
    let currentGame = initialGame;
    let detailsRequestId = 0;

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
            detail = await getGameDetails(slug);
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
        void comments.load(slug);
    };

    const open = async (): Promise<void> => {
        if (!layout.dialog.open) {
            if (typeof layout.dialog.showModal === 'function') {
                layout.dialog.showModal();
            } else {
                layout.dialog.setAttribute('open', 'open');
            }
        }

        const routeState = readRouteState();
        updateRouteState({
            page: routeState.page,
            category: routeState.category,
            sort: routeState.sort,
            pageNumber: routeState.pageNumber,
            game: currentGame.slug ?? undefined,
            auth: undefined,
        });

        await loadGameDetails();
    };

    layout.dialog.addEventListener('close', () => {
        closeDialogAndRevertRoute();
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

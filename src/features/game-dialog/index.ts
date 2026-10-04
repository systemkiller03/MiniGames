import './styles/game-dialog.scss';
import {
    getGameCommentsWithMeta,
    getGameDetails,
    type ApiGameComment,
    type ApiGameDetails,
} from './api/game-details.api';
import { createEmptyState } from './components/empty';
import { createErrorState } from './components/error';
import {
    createGameDialogComponent,
    DEFAULT_GAME,
    type GameDialogData,
    type GameRecord,
    type GameComment,
} from './components/game-dialog';
import { createGameDialogLayout } from './components/layout';
import { createLoadingState } from './components/loading';
import { getHeroImage } from '@/shared/utils/game-images';

export type { GameDialogData } from './components/game-dialog';

function formatRelativeTime(isoDate: string): string {
    const diffMs = Date.now() - new Date(isoDate).getTime();

    if (!Number.isFinite(diffMs) || diffMs <= 0) {
        return 'just now';
    }

    const minutes = Math.floor(diffMs / 60_000);
    if (minutes < 1) {
        return 'just now';
    }
    if (minutes < 60) {
        return `${minutes} min${minutes === 1 ? '' : 's'} ago`;
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    }

    const days = Math.floor(hours / 24);
    if (days < 7) {
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    const weeks = Math.floor(days / 7);
    if (weeks < 4) {
        return `${weeks} week${weeks === 1 ? '' : 's'} ago`;
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return `${months} month${months === 1 ? '' : 's'} ago`;
    }

    const years = Math.floor(days / 365);
    return `${years} year${years === 1 ? '' : 's'} ago`;
}

function toTone(name: string): GameComment['tone'] {
    const toneMap: Record<string, GameComment['tone']> = {
        b: 'blue',
        c: 'mist',
        f: 'blue',
        h: 'yellow',
        y: 'yellow',
    };

    return toneMap[name.charAt(0).toLowerCase()] ?? 'mist';
}

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

function mapApiCommentToGameComment(comment: ApiGameComment): GameComment {
    return {
        name: comment.authorName,
        avatar: comment.authorName.charAt(0).toUpperCase(),
        tone: toTone(comment.authorName),
        time: formatRelativeTime(comment.createdAt),
        text: comment.text,
        likes: comment.likesCount,
    };
}

export function createGameDialog(initialGame: GameDialogData = DEFAULT_GAME): {
    dialog: HTMLDialogElement;
    setGame: (game: GameDialogData) => void;
    open: () => Promise<void>;
    close: () => void;
} {
    const layout = createGameDialogLayout();
    const component = createGameDialogComponent(layout, initialGame);
    let currentGame = initialGame;

    const setGame = (game: GameDialogData): void => {
        currentGame = game;
        component.setGame(game);
    };

    const loadGameDetails = async (): Promise<void> => {
        const slug = currentGame.slug ?? DEFAULT_GAME.slug;

        if (!slug) {
            setGame(currentGame);
            return;
        }

        layout.setContent(createLoadingState());
        try {
            const detail = await getGameDetails(slug);
            if (!detail.name) {
                layout.setContent(createEmptyState('This game is not available right now.'));
                return;
            }

            const { comments, totalCount } = await getGameCommentsWithMeta(slug, {
                limit: 3,
                sort: 'newest',
            });
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
                totalComments: totalCount,
                comments: comments.map((comment) => mapApiCommentToGameComment(comment)),
            });
        } catch {
            layout.setContent(createErrorState(() => void loadGameDetails()));
        }
    };

    const open = async (): Promise<void> => {
        if (!layout.dialog.open) {
            if (typeof layout.dialog.showModal === 'function') {
                layout.dialog.showModal();
            } else {
                layout.dialog.setAttribute('open', 'open');
            }
        }

        await loadGameDetails();
    };

    return {
        dialog: layout.dialog,
        setGame,
        open,
        close: () => layout.dialog.close(),
    };
}

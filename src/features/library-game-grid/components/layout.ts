import '../styles/library-game-grid.scss';
import type { GameDialogData } from '@/features/game-dialog';
import { renderGameList } from './game-list';
import type { LibraryGameCard } from './types';
import { createEmptyState } from './empty';
import { createErrorState } from './error';
import { createLoadingState } from './loading';
export type { LibraryGameCard } from './types';

export type LibraryGameGridLayout = {
    element: HTMLElement;
    setLoading: () => void;
    setEmpty: () => void;
    setError: (onRetry: () => void) => void;
    setGames: (games: LibraryGameCard[], onOpenGame: (game: GameDialogData) => void) => void;
};

export function createLibraryGameGridLayout(): LibraryGameGridLayout {
    const element = document.createElement('section');
    element.classList.add('game-cards');

    return {
        element,
        setLoading: () => {
            element.dataset.state = 'loading';
            element.replaceChildren(createLoadingState());
        },
        setEmpty: () => {
            element.dataset.state = 'empty';
            element.replaceChildren(createEmptyState());
        },
        setError: (onRetry) => {
            element.dataset.state = 'error';
            element.replaceChildren(createErrorState(onRetry));
        },
        setGames: (games, onOpenGame) => {
            element.dataset.state = 'ready';
            renderGameList(element, games, onOpenGame);
        },
    };
}

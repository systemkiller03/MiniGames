import { createCard } from './card';
import type { GameDialogData } from '@/features/game-dialog';
import type { LibraryGameCard } from './types';

export function renderGameList(
    container: HTMLElement,
    games: LibraryGameCard[],
    onOpenGame: (game: GameDialogData) => void,
): void {
    container.replaceChildren();

    for (const game of games) {
        const card = createCard(
            {
                imgSrc: game.imgSrc,
                name: game.name,
                description: game.description,
                category: game.category,
                cost: game.cost,
                stars: game.stars,
                likes: game.likes,
            },
            () => onOpenGame(game.dialogData),
        );
        container.append(card);
    }
}

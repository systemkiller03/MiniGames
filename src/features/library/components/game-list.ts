import { createCard } from '@/features/card/card';
import type { GameDialogData } from '@/features/game-dialog';
import { getCardImage as getLocalCardImage } from '@/shared/utils/game-images';
import type { ApiLibraryGame } from '../api/library.api';

function toTitleCase(value: string): string {
    return value
        .split(/[-\s]+/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ');
}

function getAbsoluteImageUrl(value: string): string {
    try {
        return new URL(value, import.meta.env.VITE_API_URL).href;
    } catch {
        return value;
    }
}

function getCardImage(game: ApiLibraryGame): string {
    const localImage = getLocalCardImage(game.cardImage);
    return localImage ?? getAbsoluteImageUrl(game.cardImage);
}

function toDialogData(game: ApiLibraryGame, image: string): GameDialogData {
    return {
        slug: game.slug,
        image,
        title: game.name,
        category: toTitleCase(game.category),
        price: game.price,
        rating: Number(game.rating),
        likes: Number(game.likesCount),
        description: game.shortDescription,
        tags: [],
        players: 'Solo',
        duration: '40-90 min',
        mode: 'Desktop',
    };
}

export function renderGameList(
    container: HTMLElement,
    games: ApiLibraryGame[],
    onOpenGame: (game: GameDialogData) => void,
): void {
    container.replaceChildren();

    for (const game of games) {
        const image = getCardImage(game);
        const card = createCard(
            {
                imgSrc: image,
                name: game.name,
                description: game.shortDescription,
                category: toTitleCase(game.category),
                cost: game.price,
                stars: Number(game.rating),
                likes: Number(game.likesCount),
            },
            () => onOpenGame(toDialogData(game, image)),
        );
        container.append(card);
    }
}

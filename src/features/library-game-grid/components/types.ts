import type { GameDialogData } from '@/features/game-dialog';

export type LibraryGameCard = {
    imgSrc: string;
    name: string;
    description: string;
    category: string;
    cost: string;
    stars: number;
    likes: number;
    dialogData: GameDialogData;
};

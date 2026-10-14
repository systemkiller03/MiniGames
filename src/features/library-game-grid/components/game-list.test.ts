import { describe, expect, it, vi } from 'vitest';

import { renderGameList } from './game-list';

describe('renderGameList', () => {
    it('replaces old cards and passes the selected dialog model to the opener', () => {
        const container = document.createElement('section');
        container.append(document.createElement('p'));
        const dialogData = {
            title: 'Cozy Sudoku',
            image: '/hero.jpg',
            category: 'Puzzle',
            price: 'Free',
            rating: 4.5,
            likes: 8,
            description: 'A game',
            players: 'Solo',
            duration: '10 min',
        };
        const onOpenGame = vi.fn();

        renderGameList(
            container,
            [
                {
                    imgSrc: '/card.jpg',
                    name: 'Cozy Sudoku',
                    description: 'A game',
                    category: 'Puzzle',
                    cost: 'Free',
                    stars: 4.5,
                    likes: 8,
                    dialogData,
                },
            ],
            onOpenGame,
        );

        expect(container.querySelectorAll('.game-card')).toHaveLength(1);
        expect(container.textContent).not.toContain('old');
        container.querySelector<HTMLButtonElement>('button[data-role="details"]')?.click();
        expect(onOpenGame).toHaveBeenCalledWith(dialogData);
    });
});

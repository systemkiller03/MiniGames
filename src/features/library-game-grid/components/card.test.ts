import { describe, expect, it, vi } from 'vitest';

import { createCard } from './card';

describe('createCard', () => {
    it('renders game details, formatted stats, and invokes the details action', () => {
        const onDetailsClick = vi.fn();
        const card = createCard(
            {
                imgSrc: '/games/puzzle.jpg',
                name: 'Cozy Sudoku',
                description: 'A relaxing puzzle.',
                category: 'Puzzle',
                cost: 'Free',
                stars: 1250,
                likes: 2_500_000,
            },
            onDetailsClick,
        );

        expect(card.querySelector('img')?.alt).toBe('Cozy Sudoku');
        expect(card.querySelector('[data-role="category"]')?.textContent).toBe('Puzzle');
        expect(card.querySelector('[data-price="free"]')?.textContent).toBe('Free');
        expect(card.querySelector('[data-role="stats"]')?.textContent).toContain('1.3K');
        expect(card.querySelector('[data-role="stats"]')?.textContent).toContain('2.5M');
        card.querySelector<HTMLButtonElement>('button[data-role="details"]')?.click();
        expect(onDetailsClick).toHaveBeenCalledOnce();
    });

    it('marks paid games and safely handles a missing details callback', () => {
        const card = createCard({
            imgSrc: '/game.jpg',
            name: 'Paid Game',
            description: 'Description',
            category: 'Arcade',
            cost: '$4',
            stars: 4,
            likes: 3,
        });

        expect(card.querySelector('[data-price="paid"]')?.textContent).toBe('$4');
        expect(() => card.querySelector<HTMLButtonElement>('button')?.click()).not.toThrow();
    });
});

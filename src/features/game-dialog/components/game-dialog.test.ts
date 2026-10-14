import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_GAME, createGameDialogComponent } from './game-dialog';
import { createGameDialogLayout } from './layout';

describe('createGameDialogComponent', () => {
    it('renders game details and maps favorite state to the visible button', () => {
        const layout = createGameDialogLayout();
        const comments = document.createElement('section');
        const onFavoriteToggle = vi.fn();
        const component = createGameDialogComponent(
            layout,
            comments,
            {
                ...DEFAULT_GAME,
                title: 'Cozy Sudoku',
                likes: 1250,
                records: [{ medal: '🥇', name: 'Ada', score: '3 pts', time: '1 day ago' }],
            },
            () => true,
            onFavoriteToggle,
        );

        expect(layout.content.querySelector('#game-dialog-title')?.textContent).toBe('Cozy Sudoku');
        expect(layout.image.alt).toBe('Cozy Sudoku');
        expect(layout.content.textContent).toContain('1.3K');
        expect(layout.content.textContent).toContain('Ada');
        expect(layout.content.contains(comments)).toBe(true);

        component.setFavoriteButtonState({ pressed: true, count: 9 });
        const favorite = layout.content.querySelector<HTMLButtonElement>('.game-dialog-favorite');
        expect(favorite?.getAttribute('aria-pressed')).toBe('true');
        expect(favorite?.getAttribute('aria-label')).toBe('Remove from Favorites, 9 likes');
        expect(favorite?.textContent).toContain('9');
        favorite?.click();
        expect(onFavoriteToggle).toHaveBeenCalledWith(false);

        component.setFavoriteButtonState({ pressed: false, count: 9, loading: true });
        expect(favorite?.disabled).toBe(true);
        expect(favorite?.getAttribute('aria-label')).toBe('Saving favorite');
        component.resetUserState();
        expect(
            layout.content.querySelector('.game-dialog-favorite')?.getAttribute('aria-pressed'),
        ).toBe('false');
    });

    it('blocks favorite clicks for guests and displays the default record list when omitted', () => {
        const layout = createGameDialogLayout();
        const canPerformProtectedAction = vi.fn(() => false);
        const onFavoriteToggle = vi.fn();
        createGameDialogComponent(
            layout,
            document.createElement('div'),
            { ...DEFAULT_GAME, records: undefined },
            canPerformProtectedAction,
            onFavoriteToggle,
        );

        layout.content.querySelector<HTMLButtonElement>('.game-dialog-favorite')?.click();
        expect(canPerformProtectedAction).toHaveBeenCalledWith('favorite');
        expect(onFavoriteToggle).not.toHaveBeenCalled();
        expect(layout.content.querySelectorAll('[role="listitem"]')).toHaveLength(3);
    });
});

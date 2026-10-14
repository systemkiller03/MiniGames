import { describe, expect, it, vi } from 'vitest';

import { createLibraryGameGridLayout } from './layout';

describe('createLibraryGameGridLayout', () => {
    it('switches loading, empty, error, and ready views based on query state', () => {
        const grid = createLibraryGameGridLayout();
        grid.setLoading();
        expect(grid.element.dataset.state).toBe('loading');
        grid.setEmpty();
        expect(grid.element.textContent).toContain('No games found');
        const retry = vi.fn();
        grid.setError(retry);
        expect(grid.element.dataset.state).toBe('error');
        grid.element.querySelector('button')?.click();
        expect(retry).toHaveBeenCalledOnce();

        grid.setGames([], () => {});
        expect(grid.element.dataset.state).toBe('ready');
        expect(grid.element.children).toHaveLength(0);
    });
});

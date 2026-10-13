import { describe, expect, it, vi } from 'vitest';

import {
    clearAuthParameterFromUrl,
    getNavigationUrl,
    readRouteState,
    updateRouteState,
} from './navigation';

describe('getNavigationUrl', () => {
    it('normalizes the home route to the app base URL', () => {
        expect(getNavigationUrl('/home')).toBe(import.meta.env.BASE_URL);
        expect(getNavigationUrl('/')).toBe(import.meta.env.BASE_URL);
    });

    it('adds a route query parameter for non-home paths', () => {
        expect(getNavigationUrl('/library')).toBe(`${import.meta.env.BASE_URL}?route=%2Flibrary`);
        expect(getNavigationUrl('games')).toBe(`${import.meta.env.BASE_URL}?route=%2Fgames`);
    });
});

describe('readRouteState', () => {
    it('parses library parameters and auth state from the URL', () => {
        const url = new URL(
            'https://example.com/MiniGames/?route=/library&category=action&sort=rating&page=3&game=rocket&auth=login',
        );

        expect(readRouteState(url)).toEqual({
            page: '/library',
            category: 'action',
            sort: 'rating',
            pageNumber: 3,
            game: 'rocket',
            auth: 'login',
        });
    });

    describe('updateRouteState', () => {
        it('preserves relevant library state and removes default or absent query values', () => {
            globalThis.history.replaceState(
                undefined,
                '',
                '/MiniGames/?route=%2Flibrary&category=puzzle&sort=name-asc&page=3&game=cozy-sudoku&auth=register',
            );
            updateRouteState({ pageNumber: 1, category: 'all', game: undefined, auth: undefined });

            expect(readRouteState()).toEqual({ page: '/library', sort: 'name-asc' });
            expect(globalThis.location.search).toBe('?route=%2Flibrary&sort=name-asc');
        });

        it('replaces history when requested and clears an auth query without losing other state', () => {
            globalThis.history.replaceState(
                undefined,
                '',
                '/MiniGames/?route=%2Flibrary&auth=login&page=2',
            );
            const replaceSpy = vi.spyOn(globalThis.history, 'replaceState');

            updateRouteState({ page: '/library', pageNumber: 2 }, true);
            expect(replaceSpy).toHaveBeenCalledOnce();
            expect(readRouteState().pageNumber).toBe(2);
            clearAuthParameterFromUrl();
            expect(readRouteState().auth).toBeUndefined();
            clearAuthParameterFromUrl();
            expect(replaceSpy).toHaveBeenCalledTimes(2);
        });
    });

    it('normalizes the page root and ignores invalid auth values', () => {
        const url = new URL('https://example.com/');

        expect(readRouteState(url)).toEqual({ page: '/' });

        const authUrl = new URL('https://example.com/?route=/leaderboard&auth=nonsense');
        expect(readRouteState(authUrl)).toEqual({ page: '/leaderboard' });
    });
});

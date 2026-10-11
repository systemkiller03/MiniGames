import { describe, expect, it } from 'vitest';

import { getNavigationUrl, readRouteState } from './navigation';

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

    it('normalizes the page root and ignores invalid auth values', () => {
        const url = new URL('https://example.com/');

        expect(readRouteState(url)).toEqual({ page: '/' });

        const authUrl = new URL('https://example.com/?route=/leaderboard&auth=nonsense');
        expect(readRouteState(authUrl)).toEqual({ page: '/leaderboard' });
    });
});

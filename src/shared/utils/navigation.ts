export type RouteState = {
    page: string;
    category?: string;
    sort?: string;
    pageNumber?: number;
    game?: string;
    auth?: 'login' | 'register';
};

export function getNavigationUrl(path: string): string {
    let normalizedPath = path.trim();

    if (normalizedPath === '' || normalizedPath === '/home') {
        normalizedPath = '/';
    }

    if (!normalizedPath.startsWith('/')) {
        normalizedPath = `/${normalizedPath}`;
    }

    return normalizedPath === '/'
        ? import.meta.env.BASE_URL
        : `${import.meta.env.BASE_URL}?route=${encodeURIComponent(normalizedPath)}`;
}

export function readRouteState(url: URL = new URL(globalThis.location.href)): RouteState {
    const searchParameters = new URLSearchParams(url.search);
    const routeParameter = searchParameters.get('route');
    const pathname =
        routeParameter ??
        (url.pathname.startsWith(import.meta.env.BASE_URL)
            ? url.pathname.slice(import.meta.env.BASE_URL.length)
            : url.pathname);
    const trimmedPath = pathname.replaceAll(/^\/+|\/+$/g, '');
    const path = trimmedPath ? `/${trimmedPath}` : '/';
    const page = path === '/home' ? '/' : path;
    const state: RouteState = { page };

    if (page === '/library') {
        const category = searchParameters.get('category');
        const sort = searchParameters.get('sort');
        const requestedPage = Number(searchParameters.get('page'));

        if (category) {
            state.category = category;
        }

        if (sort) {
            state.sort = sort;
        }

        if (Number.isFinite(requestedPage) && requestedPage > 0) {
            state.pageNumber = requestedPage;
        }
    }

    const game = searchParameters.get('game');
    if (game) {
        state.game = game;
    }

    const auth = searchParameters.get('auth');
    if (auth === 'login' || auth === 'register') {
        state.auth = auth;
    }

    return state;
}

export function updateRouteState(state: Partial<RouteState>, isReplace = false): void {
    const current = readRouteState();
    const nextPage = state.page ?? current.page;
    const parameters = new URLSearchParams();

    parameters.set('route', nextPage);

    if (nextPage === '/library') {
        const category = state.category ?? current.category;
        const sort = state.sort ?? current.sort;
        const pageNumber = state.pageNumber ?? current.pageNumber;

        if (category && category !== 'all') {
            parameters.set('category', category);
        }

        if (sort) {
            parameters.set('sort', sort);
        }

        if (pageNumber && pageNumber > 1) {
            parameters.set('page', String(pageNumber));
        }
    }

    if ('game' in state) {
        if (state.game === undefined) {
            parameters.delete('game');
        } else if (state.game) {
            parameters.set('game', state.game);
        }
    } else if (current.game) {
        parameters.set('game', current.game);
    }

    if ('auth' in state) {
        if (state.auth === undefined) {
            parameters.delete('auth');
        } else if (state.auth) {
            parameters.set('auth', state.auth);
        }
    } else if (current.auth) {
        parameters.set('auth', current.auth);
    }

    const url = new URL(globalThis.location.href);
    url.search = parameters.toString();

    const method = isReplace ? 'replaceState' : 'pushState';
    globalThis.history[method](undefined, '', url.href);
}

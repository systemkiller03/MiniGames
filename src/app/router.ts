import { createHomePage } from '@/pages';
import { createLibraryPage } from '@/pages/library';

const ROUTES: { [key: string]: HTMLElement } = {
    '/': createHomePage(),
    '/library': createLibraryPage(),
};
export function createRouter(main: HTMLElement): void {
    const requestedRoute = new URLSearchParams(globalThis.location.search).get('route');
    const basePath = import.meta.env.BASE_URL;
    const pathname = globalThis.location.pathname;
    const path =
        requestedRoute ??
        (pathname.startsWith(basePath) ? `/${pathname.slice(basePath.length)}` : pathname);

    const page = ROUTES[path || '/'];
    if (!page) {
        return;
    }

    main.replaceWith(page);
    return;
}

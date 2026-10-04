import { readRouteState } from '@/shared/utils/navigation';
import { createPageLoading } from '@/pages/loading';

type PageFactory = () => HTMLElement;
type PageLoader = () => Promise<PageFactory>;

const ROUTES: Record<string, PageLoader> = {
    '/': async () => {
        const { createHomePage } = await import('@/pages');
        return createHomePage;
    },
    '/library': async () => {
        const { createLibraryPage } = await import('@/pages/library');
        return createLibraryPage;
    },
};

export function createRouter(main: HTMLElement): void {
    let renderId = 0;

    const render = (): void => {
        const route = readRouteState();
        const currentRenderId = ++renderId;
        const loadPage =
            ROUTES[route.page] ??
            (async () => {
                const { createNotFoundPage } = await import('@/pages/not-found');
                return createNotFoundPage;
            });
        main.replaceChildren(createPageLoading());

        void loadPage()
            .then((pageFactory) => {
                if (currentRenderId !== renderId) {
                    return;
                }

                main.replaceChildren(pageFactory());
            })
            .catch((error: unknown) => {
                console.error(`Unable to load page "${route.page}".`, error);
                if (currentRenderId !== renderId) {
                    return;
                }

                const message = document.createElement('p');
                message.className = 'page-load-error';
                message.textContent = 'This page could not be loaded. Please try again later.';
                main.replaceChildren(message);
            });
    };

    globalThis.addEventListener('popstate', render);

    document.addEventListener('click', (event: MouseEvent) => {
        const target =
            event.target instanceof Element
                ? (event.target.closest('a[href]') ?? undefined)
                : undefined;
        if (
            !(target instanceof HTMLAnchorElement) ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            target.hasAttribute('download') ||
            (target.target && target.target !== '_self')
        ) {
            return;
        }

        const href = target.getAttribute('href');
        if (!href || href.startsWith('#')) {
            return;
        }

        const url = new URL(href, globalThis.location.href);
        if (url.origin !== globalThis.location.origin) {
            return;
        }

        const isAppUrl =
            url.pathname.startsWith(import.meta.env.BASE_URL) || url.searchParams.has('route');
        if (!isAppUrl) {
            return;
        }

        event.preventDefault();
        if (url.href !== globalThis.location.href) {
            globalThis.history.pushState(undefined, '', url.href);
        }
        render();
    });

    render();
}

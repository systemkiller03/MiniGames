import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'router-test');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
    localStorage.clear();
    document.body.replaceChildren();
    globalThis.history.replaceState(undefined, '', '/MiniGames/?route=%2Fmissing');
});

afterEach(() => {
    vi.unstubAllEnvs();
    localStorage.clear();
    document.body.replaceChildren();
});

describe('createRouter', () => {
    it('renders the not-found page for an unknown route and intercepts same-origin app links', async () => {
        const main = document.createElement('main');
        document.body.append(main);
        const { createRouter } = await import('./router');
        createRouter(main);
        await vi.waitFor(() => {
            expect(main.querySelector('h1')?.textContent).toBe('Page not found');
        });

        const appLink = document.createElement('a');
        appLink.href = '?route=%2Falso-missing';
        appLink.textContent = 'Unknown app route';
        document.body.append(appLink);
        const appClick = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
        appLink.dispatchEvent(appClick);
        expect(appClick.defaultPrevented).toBe(true);
        await vi.waitFor(() => {
            expect(main.querySelector('.not-found-page')).not.toBeNull();
        });

        const externalLink = document.createElement('a');
        externalLink.href = 'https://example.org/';
        externalLink.addEventListener('click', (event) => event.preventDefault());
        document.body.append(externalLink);
        const externalClick = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            button: 0,
        });
        const pushState = vi.spyOn(globalThis.history, 'pushState');
        externalLink.dispatchEvent(externalClick);
        expect(pushState).not.toHaveBeenCalled();
    });

    it('does not intercept modified clicks, downloads, target windows, or fragment links', async () => {
        const main = document.createElement('main');
        document.body.append(main);
        const { createRouter } = await import('./router');
        createRouter(main);

        const cases: Array<{
            href: string;
            options?: MouseEventInit;
            attributes?: Record<string, string>;
        }> = [
            { href: '?route=%2Fmissing', options: { ctrlKey: true } },
            { href: '?route=%2Fmissing', attributes: { download: '' } },
            { href: '?route=%2Fmissing', attributes: { target: '_blank' } },
            { href: '#section', attributes: {} },
        ];
        const unhandledCases = cases;
        for (const item of unhandledCases) {
            const link = document.createElement('a');
            link.href = item.href;
            const attributes = Object.entries(item.attributes ?? {});
            for (const [name, value] of attributes) {
                link.setAttribute(name, value);
            }
            document.body.append(link);
            const click = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                button: 0,
                ...item.options,
            });
            link.dispatchEvent(click);
            expect(click.defaultPrevented).toBe(false);
        }
    });
});

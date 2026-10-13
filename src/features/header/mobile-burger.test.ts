import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'mobile-menu-test');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
    localStorage.clear();
    globalThis.history.replaceState(undefined, '', '/MiniGames/');
});

afterEach(() => {
    vi.unstubAllEnvs();
    localStorage.clear();
    document.body.replaceChildren();
});

describe('createMobileBurger', () => {
    it('tracks route selection, closes on request, and switches auth actions with session state', async () => {
        const { createMobileBurger } = await import('./mobile-burger');
        const { clearAppSession, saveAppSession } = await import('@/features/auth/api/auth.api');
        const menu = createMobileBurger();
        document.body.append(menu);

        expect(menu.hidden).toBe(true);
        expect(menu.querySelectorAll('[data-auth-action]')).toHaveLength(2);
        const library = [...menu.querySelectorAll('a')].find(
            (link) => link.dataset.route === '/library',
        );
        globalThis.history.replaceState(undefined, '', '/MiniGames/?route=%2Flibrary');
        globalThis.dispatchEvent(new Event('app-route-changed'));
        expect(library?.getAttribute('aria-current')).toBe('page');

        menu.hidden = false;
        menu.querySelector<HTMLButtonElement>('[aria-label="Close menu"]')?.click();
        expect(menu.hidden).toBe(true);

        saveAppSession({
            displayName: 'Player',
            email: 'player@example.com',
            authenticatedAt: Date.now(),
        });
        expect(menu.querySelectorAll('[data-auth-action]')).toHaveLength(1);
        expect(menu.querySelector('[data-auth-action="logout"]')?.textContent).toBe('Log Out');
        clearAppSession();
        expect(menu.querySelectorAll('[data-auth-action]')).toHaveLength(2);
    });
});

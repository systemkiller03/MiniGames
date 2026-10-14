import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'header-test');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
    localStorage.clear();
});

afterEach(() => {
    vi.unstubAllEnvs();
    localStorage.clear();
    document.body.replaceChildren();
});

describe('createHeader', () => {
    it('switches between guest and profile actions as session events change', async () => {
        const { createHeader } = await import('./header');
        const { saveAppSession, clearAppSession } = await import('@/features/auth/api/auth.api');
        const header = createHeader();

        expect(header.querySelector('[data-auth-action="login"]')?.textContent).toBe('Log In');
        expect(header.querySelector('[data-auth-action="signup"]')?.textContent).toBe('Sign Up');
        expect(header.querySelector('.profile-state')).toBeNull();

        saveAppSession({
            displayName: 'Ada Lovelace',
            email: 'ada@example.com',
            authenticatedAt: Date.now(),
        });
        expect(header.querySelector('.profile-state__name')?.textContent).toBe('Ada Lovelace');
        expect(header.querySelector('[data-auth-action="login"]')).toBeNull();

        clearAppSession();
        expect(header.querySelector('[data-auth-action="login"]')?.textContent).toBe('Log In');
        expect(header.querySelector('.profile-state')).toBeNull();
    });

    it('marks the matching navigation route and opens the mobile menu', async () => {
        const { createHeader } = await import('./header');
        const { updateRouteState } = await import('@/shared/utils/navigation');
        const header = createHeader();
        updateRouteState({ page: '/library' });
        globalThis.dispatchEvent(new Event('app-route-changed'));

        expect(
            [...header.querySelectorAll(':scope nav a')]
                .find((link) => link.textContent === 'Library')
                ?.getAttribute('aria-current'),
        ).toBe('page');

        const menu = header.querySelector<HTMLElement>('.mobile-menu');
        const toggle = header.querySelector<HTMLButtonElement>('[data-mobile-menu-toggle]');
        expect(menu?.hidden).toBe(true);
        toggle?.click();
        expect(menu?.hidden).toBe(false);
        menu?.querySelector<HTMLButtonElement>('button[aria-label="Close menu"]')?.click();
        expect(menu?.hidden).toBe(true);
    });
});

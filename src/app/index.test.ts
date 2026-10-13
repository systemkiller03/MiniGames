import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const firebase = vi.hoisted(() => ({
    app: {},
    auth: {},
    getApps: vi.fn(() => []),
    initializeApp: vi.fn(() => firebase.app),
    getAuth: vi.fn(() => firebase.auth),
    signInWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    updateProfile: vi.fn(),
    signOut: vi.fn(),
}));

vi.mock('firebase/app', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/app')>();
    return { ...actual, getApps: firebase.getApps, initializeApp: firebase.initializeApp };
});

vi.mock('firebase/auth', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/auth')>();
    return {
        ...actual,
        getAuth: firebase.getAuth,
        signOut: firebase.signOut,
    };
});

beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'app-shell-test');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
    localStorage.clear();
    document.body.replaceChildren();
    globalThis.history.replaceState(undefined, '', '/MiniGames/');
    firebase.getApps.mockReturnValue([]);
    firebase.initializeApp.mockReturnValue(firebase.app);
    firebase.signOut.mockResolvedValue(undefined);
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    localStorage.clear();
    document.body.replaceChildren();
});

describe('createApp', () => {
    it('allows guest auth, guards an existing session, and logs out to Guest Mode', async () => {
        const { createApp } = await import('./index');
        const { saveAppSession, getAppSession } = await import('@/features/auth/api/auth.api');
        const main = createApp();
        expect(main.tagName).toBe('MAIN');

        document.body.querySelector<HTMLButtonElement>('[data-auth-action="login"]')?.click();
        expect(new URL(globalThis.location.href).searchParams.get('auth')).toBe('login');
        const dialog = document.body.querySelector<HTMLDialogElement>('.auth-dialog');
        expect(dialog?.hasAttribute('open')).toBe(true);

        saveAppSession({
            displayName: 'Ada Lovelace',
            email: 'ada@example.com',
            authenticatedAt: Date.now(),
        });
        globalThis.dispatchEvent(new Event('app-route-changed'));
        expect(dialog?.hasAttribute('open')).toBe(false);
        expect(new URL(globalThis.location.href).searchParams.has('auth')).toBe(false);
        expect(document.body.textContent).toContain('You are already signed in.');

        globalThis.dispatchEvent(
            new CustomEvent('app-auth-required', { detail: { reason: 'favorite' } }),
        );
        expect(document.body.textContent).toContain('Please sign in to save favorites.');

        firebase.signOut.mockRejectedValueOnce(new Error('offline'));
        document.body.querySelector<HTMLButtonElement>('[data-auth-action="logout"]')?.click();
        await vi.waitFor(() => {
            expect(document.body.textContent).toContain(
                'sign-out could not be completed with the authentication service.',
            );
        });
        expect(getAppSession()).toBeUndefined();
        expect(firebase.signOut).toHaveBeenCalledOnce();
        expect(document.body.querySelector('[data-auth-action="login"]')).not.toBeNull();

        saveAppSession({
            displayName: 'Ada Lovelace',
            email: 'ada@example.com',
            authenticatedAt: Date.now(),
        });
        document.body.querySelector<HTMLButtonElement>('[data-auth-action="logout"]')?.click();
        await vi.waitFor(() => {
            expect(document.body.textContent).toContain('You have signed out.');
        });
        expect(firebase.signOut).toHaveBeenCalledTimes(2);
        expect(getAppSession()).toBeUndefined();
    });

    it('notifies the user when an app session expires', async () => {
        const { createApp } = await import('./index');
        createApp();
        globalThis.dispatchEvent(new Event('app-session-expired'));

        expect(document.body.textContent).toContain(
            'Your session has expired. Please sign in again.',
        );
    });
});

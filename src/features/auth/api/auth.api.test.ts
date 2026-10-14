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
    setCustomParameters: vi.fn(),
}));

vi.mock('firebase/app', () => ({
    getApps: firebase.getApps,
    initializeApp: firebase.initializeApp,
}));

vi.mock('firebase/auth', () => ({
    GoogleAuthProvider: class {
        setCustomParameters = firebase.setCustomParameters;
    },
    createUserWithEmailAndPassword: firebase.createUserWithEmailAndPassword,
    getAuth: firebase.getAuth,
    signInWithEmailAndPassword: firebase.signInWithEmailAndPassword,
    signInWithPopup: firebase.signInWithPopup,
    signOut: firebase.signOut,
    updateProfile: firebase.updateProfile,
}));

beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'example-project');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
    vi.useRealTimers();
    localStorage.clear();
    vi.clearAllMocks();
    firebase.getApps.mockReturnValue([]);
    firebase.initializeApp.mockReturnValue(firebase.app);
    firebase.signOut.mockResolvedValue(undefined);
});

afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    localStorage.clear();
    vi.restoreAllMocks();
});

describe('auth.api', () => {
    it('builds a safe session with a project-scoped key and exact authentication time', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-02T03:04:05.000Z'));
        const api = await import('./auth.api');

        const session = api.createAppSession({
            displayName: '  Ada Lovelace  ',
            email: 'ada@example.com',
            photoURL: ' https://example.com/ada.png ',
        });
        api.saveAppSession(Object.assign({}, session, { password: 'never-store' }));

        expect(api.APP_SESSION_STORAGE_KEY).toBe('minigames:example-project:app-session');
        expect(session).toEqual({
            displayName: 'Ada Lovelace',
            email: 'ada@example.com',
            authenticatedAt: Date.now(),
            avatarUrl: ' https://example.com/ada.png ',
        });
        expect(JSON.parse(localStorage.getItem(api.APP_SESSION_STORAGE_KEY) ?? '{}')).toEqual({
            displayName: 'Ada Lovelace',
            email: 'ada@example.com',
            authenticatedAt: Date.now(),
            avatarUrl: 'https://example.com/ada.png',
        });
        expect(api.APP_SESSION_LIFETIME_MS).toBe(5 * 60 * 1000);
    });

    it('restores a valid session without extending its original five-minute lifetime', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(1_000_000);
        const api = await import('./auth.api');
        const authenticatedAt = Date.now() - 60_000;
        localStorage.setItem(
            api.APP_SESSION_STORAGE_KEY,
            JSON.stringify({
                displayName: ' Ada ',
                email: ' ada@example.com ',
                authenticatedAt,
                avatarUrl: ' https://example.com/ada.png ',
            }),
        );

        expect(api.getAppSession()).toEqual({
            displayName: 'Ada',
            email: 'ada@example.com',
            authenticatedAt,
            avatarUrl: 'https://example.com/ada.png',
        });
        vi.advanceTimersByTime(4 * 60 * 1000);
        expect(api.getAppSession()).toBeUndefined();
        expect(localStorage.getItem(api.APP_SESSION_STORAGE_KEY)).toBeNull();
        expect(firebase.signOut).toHaveBeenCalledWith(firebase.auth);
    });

    it.each([
        ['corrupted JSON', '{'],
        ['missing required data', JSON.stringify({ email: 'a@example.com' })],
        [
            'future timestamp',
            JSON.stringify({
                displayName: 'Ada',
                email: 'ada@example.com',
                authenticatedAt: Number.MAX_SAFE_INTEGER,
            }),
        ],
        [
            'tampered token field',
            JSON.stringify({
                displayName: 'Ada',
                email: 'ada@example.com',
                authenticatedAt: Date.now(),
                token: 'secret',
            }),
        ],
    ])('clears %s data instead of restoring it', async (_caseName, invalidValue) => {
        const api = await import('./auth.api');
        localStorage.setItem(api.APP_SESSION_STORAGE_KEY, invalidValue);

        expect(api.getAppSession()).toBeUndefined();
        expect(localStorage.getItem(api.APP_SESSION_STORAGE_KEY)).toBeNull();
    });

    it('expires the session at the five-minute boundary and signs Firebase out', async () => {
        vi.useFakeTimers();
        vi.setSystemTime(1_000_000);
        const api = await import('./auth.api');
        const session = api.createAppSession({
            displayName: 'Player',
            email: 'player@example.com',
            photoURL: '',
        });
        api.saveAppSession(session);
        expect(api.getAppSession()).toEqual(session);

        vi.advanceTimersByTime(api.APP_SESSION_LIFETIME_MS);
        expect(api.getAppSession()).toBeUndefined();
        expect(localStorage.getItem(api.APP_SESSION_STORAGE_KEY)).toBeNull();
        expect(firebase.signOut).toHaveBeenCalledWith(firebase.auth);
    });

    it('signs in with trimmed email and selects an account for Google sign-in', async () => {
        const api = await import('./auth.api');
        firebase.signInWithEmailAndPassword.mockResolvedValue({ user: { email: 'p@example.com' } });
        firebase.signInWithPopup.mockResolvedValue({ user: { email: 'p@example.com' } });

        await api.signInWithEmail(' player@example.com ', 'Secret1!');
        await api.signInWithGoogle();

        expect(firebase.initializeApp).toHaveBeenCalledWith({
            apiKey: 'key',
            authDomain: 'example.firebaseapp.com',
            projectId: 'example-project',
            appId: 'app-id',
        });
        expect(firebase.getAuth).toHaveBeenCalledWith(firebase.app);
        expect(firebase.signInWithEmailAndPassword).toHaveBeenCalledWith(
            firebase.auth,
            'player@example.com',
            'Secret1!',
        );
        expect(firebase.setCustomParameters).toHaveBeenCalledWith({ prompt: 'select_account' });
        expect(firebase.signInWithPopup).toHaveBeenCalledWith(firebase.auth, expect.any(Object));
    });

    it('registers with the requested name or derives a fallback and updates Firebase profile', async () => {
        const api = await import('./auth.api');
        const user = { displayName: '', email: 'player@example.com', photoURL: '' };
        firebase.createUserWithEmailAndPassword.mockResolvedValue({ user });

        const result = await api.registerWithEmail(
            '  Cozy Player  ',
            ' player@example.com ',
            'Pass1!',
        );
        expect(firebase.createUserWithEmailAndPassword).toHaveBeenCalledWith(
            firebase.auth,
            'player@example.com',
            'Pass1!',
        );
        expect(firebase.updateProfile).toHaveBeenCalledWith(user, { displayName: 'Cozy Player' });
        expect(result.user.displayName).toBe('Cozy Player');

        firebase.createUserWithEmailAndPassword.mockResolvedValue({
            user: { displayName: 'player', email: 'player@example.com' },
        });
        firebase.updateProfile.mockClear();
        const fallback = await api.registerWithEmail(' ', 'player@example.com', 'Pass1!');
        expect(firebase.updateProfile).not.toHaveBeenCalled();
        expect(fallback.user.displayName).toBe('player');
    });

    it('removes session data on logout and rejects when Firebase sign-out fails', async () => {
        const api = await import('./auth.api');
        api.saveAppSession({
            displayName: 'Player',
            email: 'player@example.com',
            authenticatedAt: Date.now(),
        });

        await api.signOutAppSession();
        expect(localStorage.getItem(api.APP_SESSION_STORAGE_KEY)).toBeNull();
        expect(firebase.signOut).toHaveBeenCalledWith(firebase.auth);

        api.saveAppSession({
            displayName: 'Player',
            email: 'player@example.com',
            authenticatedAt: Date.now(),
        });
        firebase.signOut.mockRejectedValueOnce(new Error('network unavailable'));
        await expect(api.signOutAppSession()).rejects.toThrow('network unavailable');
        expect(localStorage.getItem(api.APP_SESSION_STORAGE_KEY)).toBeNull();
    });

    it('returns Guest Mode when Firebase is not configured', async () => {
        vi.stubEnv('VITE_FIREBASE_API_KEY', '');
        vi.resetModules();
        const api = await import('./auth.api');

        expect(() => api.getFirebaseAuth()).toThrow('Firebase is not configured.');
        expect(api.getAppSession()).toBeUndefined();
    });
});

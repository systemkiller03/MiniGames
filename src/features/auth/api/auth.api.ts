import {
    type User,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from 'firebase/auth';
import { getApps, initializeApp } from 'firebase/app';

export const APP_SESSION_STORAGE_KEY = 'minigames:app-session';
export const APP_SESSION_LIFETIME_MS = 5 * 60 * 1000;

export type AppSession = {
    displayName: string;
    email: string;
    authenticatedAt: number;
    avatarUrl?: string;
};

type AppSessionChangeReason = 'expired' | 'invalid';
const expirationTimer: { id: number | undefined } = { id: undefined };

const firebaseConfig = {
    apiKey: (import.meta.env.VITE_FIREBASE_API_KEY ?? '').trim(),
    authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '').trim(),
    projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '').trim(),
    appId: (import.meta.env.VITE_FIREBASE_APP_ID ?? '').trim(),
};

function hasFirebaseConfig(config: typeof firebaseConfig): boolean {
    return Object.values(config).every((value) => value.length > 0);
}

function signOutFirebase(): void {
    try {
        void signOut(getFirebaseAuth()).catch(() => false);
    } catch {
        // An unconfigured Firebase app must not prevent the app from starting in Guest Mode.
    }
}

function clearInvalidAppSession(reason: AppSessionChangeReason): void {
    if (expirationTimer.id !== undefined) {
        globalThis.clearTimeout(expirationTimer.id);
        expirationTimer.id = undefined;
    }
    try {
        globalThis.localStorage.removeItem(APP_SESSION_STORAGE_KEY);
    } catch {
        // Keep session cleanup best-effort when storage is unavailable.
    }
    notifyAppSessionChanged(undefined);
    const expirationEvent =
        reason === 'expired' ? new CustomEvent('app-session-expired') : undefined;
    if (expirationEvent) {
        globalThis.dispatchEvent(expirationEvent);
    }
    signOutFirebase();
}

function isAppSession(value: unknown): value is AppSession {
    return typeof value === 'object' && value !== null && !Array.isArray(value)
        ? isAppSessionRecord(value as Record<string, unknown>)
        : false;
}

function isAppSessionRecord(session: Record<string, unknown>): boolean {
    const allowedKeys = new Set(['displayName', 'email', 'authenticatedAt', 'avatarUrl']);
    return (
        Object.keys(session).every((key) => allowedKeys.has(key)) &&
        typeof session.displayName === 'string' &&
        session.displayName.trim().length > 0 &&
        typeof session.email === 'string' &&
        session.email.trim().length > 0 &&
        typeof session.authenticatedAt === 'number' &&
        Number.isSafeInteger(session.authenticatedAt) &&
        session.authenticatedAt >= 0 &&
        (session.avatarUrl === undefined || typeof session.avatarUrl === 'string')
    );
}

export function getFirebaseAuth() {
    if (!hasFirebaseConfig(firebaseConfig)) {
        throw new Error(
            'Firebase is not configured. Add VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID, and VITE_FIREBASE_APP_ID to your .env file.',
        );
    }
    const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    return getAuth(app);
}

function toDisplayName(email: string, fallback = 'Player'): string {
    const localPart = email.split('@', 2)[0]?.trim();
    return localPart && localPart.length >= 2 ? localPart : fallback;
}

export function getAppSession(): AppSession | undefined {
    let rawSession: string | null;
    try {
        rawSession = globalThis.localStorage.getItem(APP_SESSION_STORAGE_KEY);
    } catch {
        return undefined;
    }

    if (rawSession === null) {
        return undefined;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(rawSession);
    } catch {
        clearInvalidAppSession('invalid');
        return undefined;
    }

    if (!isAppSession(parsed) || parsed.authenticatedAt > Date.now()) {
        clearInvalidAppSession('invalid');
        return undefined;
    }

    if (Date.now() - parsed.authenticatedAt >= APP_SESSION_LIFETIME_MS) {
        clearInvalidAppSession('expired');
        return undefined;
    }

    if (expirationTimer.id !== undefined) {
        globalThis.clearTimeout(expirationTimer.id);
    }
    expirationTimer.id = globalThis.setTimeout(
        () => {
            expirationTimer.id = undefined;
            getAppSession();
        },
        parsed.authenticatedAt + APP_SESSION_LIFETIME_MS - Date.now(),
    );

    return {
        displayName: parsed.displayName.trim(),
        email: parsed.email.trim(),
        authenticatedAt: parsed.authenticatedAt,
        ...(parsed.avatarUrl?.trim() && { avatarUrl: parsed.avatarUrl.trim() }),
    };
}

export function initializeAppSession(): AppSession | undefined {
    const session = getAppSession();
    globalThis.addEventListener('pageshow', getAppSession);
    globalThis.addEventListener('focus', getAppSession);
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible') {
            return;
        }
        getAppSession();
    });
    globalThis.addEventListener('storage', (event: StorageEvent) => {
        if (event.key !== APP_SESSION_STORAGE_KEY) {
            return;
        }
        const changedSession = getAppSession();
        notifyAppSessionChanged(changedSession);
    });
    return session;
}

export async function signInWithEmail(email: string, password: string) {
    const auth = getFirebaseAuth();
    return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function signInWithGoogle() {
    const auth = getFirebaseAuth();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    return signInWithPopup(auth, provider);
}

export async function registerWithEmail(username: string, email: string, password: string) {
    const auth = getFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);

    const nextDisplayName = username.trim() || toDisplayName(userCredential.user.email ?? '');
    const shouldUpdateDisplayName = userCredential.user.displayName !== nextDisplayName;
    if (shouldUpdateDisplayName) {
        await updateProfile(userCredential.user, { displayName: nextDisplayName });
    }

    return {
        ...userCredential,
        user: {
            ...userCredential.user,
            displayName: nextDisplayName,
        },
    };
}

export function createAppSession(
    user: Pick<User, 'displayName' | 'email' | 'photoURL'>,
): AppSession {
    const email = user.email ?? '';
    const displayName = user.displayName?.trim() || toDisplayName(email, 'Player');

    return {
        displayName,
        email,
        authenticatedAt: Date.now(),
        ...(user.photoURL && { avatarUrl: user.photoURL }),
    };
}

function notifyAppSessionChanged(session: AppSession | undefined): void {
    globalThis.dispatchEvent(new CustomEvent('app-session-updated', { detail: { session } }));
}

export function saveAppSession(session: AppSession): void {
    const storedSession: AppSession = {
        displayName: session.displayName,
        email: session.email,
        authenticatedAt: session.authenticatedAt,
        ...(session.avatarUrl?.trim() && { avatarUrl: session.avatarUrl.trim() }),
    };
    try {
        globalThis.localStorage.setItem(APP_SESSION_STORAGE_KEY, JSON.stringify(storedSession));
        notifyAppSessionChanged(storedSession);
    } catch {
        // Ignore storage failures so the auth flow can still complete gracefully.
    }
}

export function clearAppSession(): void {
    if (expirationTimer.id !== undefined) {
        globalThis.clearTimeout(expirationTimer.id);
        expirationTimer.id = undefined;
    }
    try {
        globalThis.localStorage.removeItem(APP_SESSION_STORAGE_KEY);
    } catch {
        // Ignore storage failures during sign-out cleanup.
    }
    notifyAppSessionChanged(undefined);
}

export async function signOutAppSession(): Promise<void> {
    clearAppSession();
    await signOut(getFirebaseAuth());
}

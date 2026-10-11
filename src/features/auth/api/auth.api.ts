import { initializeApp, getApps } from 'firebase/app';
import {
    type User,
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    getAuth,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
} from 'firebase/auth';

export const APP_SESSION_STORAGE_KEY = 'minigames:app-session';

export type AppSession = {
    displayName: string;
    email: string;
    authenticatedAt: number;
    avatarUrl?: string;
};

const firebaseConfig = {
    apiKey: (import.meta.env.VITE_FIREBASE_API_KEY ?? '').trim(),
    authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '').trim(),
    projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '').trim(),
    appId: (import.meta.env.VITE_FIREBASE_APP_ID ?? '').trim(),
};

function hasFirebaseConfig(config: typeof firebaseConfig): boolean {
    return Object.values(config).every((value) => value.length > 0);
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

export function saveAppSession(session: AppSession): void {
    try {
        globalThis.localStorage.setItem(APP_SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
        // Ignore storage failures so the auth flow can still complete gracefully.
    }
}

export function clearAppSession(): void {
    try {
        globalThis.localStorage.removeItem(APP_SESSION_STORAGE_KEY);
    } catch {
        // Ignore storage failures during sign-out cleanup.
    }
}

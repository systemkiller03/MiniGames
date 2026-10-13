import { FirebaseError } from 'firebase/app';
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

vi.mock('firebase/app', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/app')>();
    return {
        ...actual,
        getApps: firebase.getApps,
        initializeApp: firebase.initializeApp,
    };
});

vi.mock('firebase/auth', async (importOriginal) => {
    const actual = await importOriginal<typeof import('firebase/auth')>();
    return {
        ...actual,
        GoogleAuthProvider: class {
            setCustomParameters = firebase.setCustomParameters;
        },
        createUserWithEmailAndPassword: firebase.createUserWithEmailAndPassword,
        getAuth: firebase.getAuth,
        signInWithEmailAndPassword: firebase.signInWithEmailAndPassword,
        signInWithPopup: firebase.signInWithPopup,
        signOut: firebase.signOut,
        updateProfile: firebase.updateProfile,
    };
});

function findField(dialog: HTMLDialogElement, name: string): HTMLInputElement {
    const field = dialog.querySelector<HTMLInputElement>(`[data-auth-field="${CSS.escape(name)}"]`);
    if (!field) {
        throw new Error(`Missing auth field: ${name}`);
    }
    return field;
}

function changeField(field: HTMLInputElement, value: string): void {
    field.value = value;
    field.dispatchEvent(new Event('input', { bubbles: true }));
}

function submitForm(dialog: HTMLDialogElement): void {
    const form = dialog.querySelector('form');
    if (!form) {
        throw new Error('Missing auth form');
    }
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
}

async function makeDialog(): Promise<HTMLDialogElement> {
    const { createAuthDialog } = await import('./auth');
    const { dialog } = createAuthDialog();
    document.body.append(dialog);
    return dialog;
}

beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'auth-ui-project');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
    localStorage.clear();
    document.body.replaceChildren();
    firebase.getApps.mockReturnValue([]);
    firebase.initializeApp.mockReturnValue(firebase.app);
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
    localStorage.clear();
    document.body.replaceChildren();
});

describe('createAuthDialog', () => {
    it('updates field errors and submit availability as login input becomes valid', async () => {
        const dialog = await makeDialog();
        const submit = dialog.querySelector<HTMLButtonElement>('button[type="submit"]');
        const email = findField(dialog, 'email');
        const password = findField(dialog, 'password');

        expect(submit?.disabled).toBe(true);
        changeField(email, 'bad-address');
        changeField(password, 'secret1');
        expect(dialog.querySelector('#email-error')?.textContent).toBe(
            'Enter a valid email address.',
        );
        expect(submit?.disabled).toBe(true);

        changeField(email, 'player@example.com');
        expect(dialog.querySelector('#email-error')?.textContent).toBe('');
        expect(submit?.disabled).toBe(false);
    });

    it('enforces registration rules and updates the matching-password error', async () => {
        const { createAuthDialog } = await import('./auth');
        const { dialog, setMode } = createAuthDialog();
        document.body.append(dialog);
        setMode('register');
        const username = findField(dialog, 'username');
        const email = findField(dialog, 'email');
        const password = findField(dialog, 'password');
        const confirmation = findField(dialog, 'confirmPassword');
        const submit = dialog.querySelector<HTMLButtonElement>('button[type="submit"]');

        changeField(username, 'a');
        changeField(email, 'player@example.com');
        changeField(password, 'Player1!');
        changeField(confirmation, 'Player2!');
        expect(dialog.querySelector('#username-error')?.textContent).toBe(
            'Username must be 2-30 characters long.',
        );
        expect(dialog.querySelector('#confirmPassword-error')?.textContent).toBe(
            'Passwords do not match.',
        );
        expect(submit?.disabled).toBe(true);

        changeField(username, 'CozyGamer99');
        changeField(confirmation, 'Player1!');
        expect(dialog.querySelector('#confirmPassword-error')?.textContent).toBe('');
        expect(submit?.disabled).toBe(false);
    });

    it('locks fields during sign-in, saves the session on success, and restores the form', async () => {
        firebase.signInWithEmailAndPassword.mockImplementation(
            () =>
                new Promise((resolve) => {
                    setTimeout(
                        () =>
                            resolve({
                                user: { displayName: 'Player', email: 'player@example.com' },
                            }),
                        0,
                    );
                }),
        );
        const dialog = await makeDialog();
        changeField(findField(dialog, 'email'), ' player@example.com ');
        changeField(findField(dialog, 'password'), 'secret1');
        submitForm(dialog);

        const submit = dialog.querySelector<HTMLButtonElement>('button[type="submit"]');
        expect(findField(dialog, 'email').disabled).toBe(true);
        expect(findField(dialog, 'password').disabled).toBe(true);
        expect(submit?.disabled).toBe(true);
        expect(submit?.textContent).toBe('Logging in...');
        expect(dialog.textContent).toContain('Signing you in...');

        await vi.waitFor(() => {
            expect(localStorage.getItem('minigames:auth-ui-project:app-session')).not.toBeNull();
        });
        expect(
            JSON.parse(localStorage.getItem('minigames:auth-ui-project:app-session') ?? '{}'),
        ).toMatchObject({
            displayName: 'Player',
            email: 'player@example.com',
        });
        expect(submit?.disabled).toBe(false);
        expect(findField(dialog, 'email').disabled).toBe(false);
    });

    it('maps wrong-password and email-in-use errors to visible form messages', async () => {
        firebase.signInWithEmailAndPassword.mockRejectedValue(
            new FirebaseError('auth/wrong-password', 'wrong password'),
        );
        const dialog = await makeDialog();
        changeField(findField(dialog, 'email'), 'player@example.com');
        changeField(findField(dialog, 'password'), 'secret1');
        submitForm(dialog);
        await vi.waitFor(() => {
            expect(dialog.querySelector('.auth-status-error')?.textContent).toBe(
                'Email or password is incorrect.',
            );
        });

        const { createAuthDialog } = await import('./auth');
        const { dialog: registration, setMode } = createAuthDialog();
        setMode('register');
        document.body.append(registration);
        changeField(findField(registration, 'username'), 'Player1');
        changeField(findField(registration, 'email'), 'player@example.com');
        changeField(findField(registration, 'password'), 'Player1!');
        changeField(findField(registration, 'confirmPassword'), 'Player1!');
        firebase.createUserWithEmailAndPassword.mockRejectedValue(
            new FirebaseError('auth/email-already-in-use', 'duplicate'),
        );
        submitForm(registration);
        await vi.waitFor(() => {
            expect(registration.querySelector('.auth-status-error')?.textContent).toBe(
                'An account with this email already exists. Try signing in instead.',
            );
        });
    });

    it('maps a Firebase network error to the retryable connection message', async () => {
        firebase.signInWithEmailAndPassword.mockRejectedValue(
            new FirebaseError('auth/network-request-failed', 'network error'),
        );
        const dialog = await makeDialog();
        changeField(findField(dialog, 'email'), 'player@example.com');
        changeField(findField(dialog, 'password'), 'secret1');
        submitForm(dialog);

        await vi.waitFor(() => {
            expect(dialog.querySelector('.auth-status-error')?.textContent).toBe(
                'Unable to connect to the authentication service. Check your connection and try again.',
            );
        });
        expect(findField(dialog, 'email').disabled).toBe(false);
    });

    it('creates an app session after successful registration', async () => {
        firebase.createUserWithEmailAndPassword.mockResolvedValue({
            user: {
                displayName: '',
                email: 'player@example.com',
                photoURL: '',
            },
        });
        firebase.updateProfile.mockResolvedValue(undefined);
        const { createAuthDialog } = await import('./auth');
        const { dialog, setMode } = createAuthDialog();
        document.body.append(dialog);
        setMode('register');
        changeField(findField(dialog, 'username'), 'CozyPlayer');
        changeField(findField(dialog, 'email'), 'player@example.com');
        changeField(findField(dialog, 'password'), 'Player1!');
        changeField(findField(dialog, 'confirmPassword'), 'Player1!');
        submitForm(dialog);

        await vi.waitFor(() => {
            expect(localStorage.getItem('minigames:auth-ui-project:app-session')).not.toBeNull();
        });
        expect(firebase.createUserWithEmailAndPassword).toHaveBeenCalledWith(
            firebase.auth,
            'player@example.com',
            'Player1!',
        );
        expect(
            JSON.parse(localStorage.getItem('minigames:auth-ui-project:app-session') ?? '{}'),
        ).toMatchObject({
            displayName: 'CozyPlayer',
            email: 'player@example.com',
        });
        expect(document.body.textContent).toContain('Account created for CozyPlayer.');
    });

    it('starts Google sign-in, locks the button, and reports a canceled popup', async () => {
        firebase.signInWithPopup.mockImplementation(
            () =>
                new Promise((_resolve, reject) => {
                    setTimeout(
                        () => reject(new FirebaseError('auth/popup-closed-by-user', 'closed')),
                        0,
                    );
                }),
        );
        const dialog = await makeDialog();
        const google = [...dialog.querySelectorAll('button')].find((button) =>
            button.textContent?.includes('Continue with Google'),
        );
        google?.click();

        expect(google?.disabled).toBe(true);
        expect(dialog.textContent).toContain('Connecting to Google...');
        expect(firebase.setCustomParameters).toHaveBeenCalledWith({ prompt: 'select_account' });
        await vi.waitFor(() => {
            expect(dialog.querySelector('.auth-status-error')?.textContent).toBe(
                'Google sign-in was canceled or failed. Please try again.',
            );
        });
        expect(google?.disabled).toBe(false);
        expect(localStorage.getItem('minigames:auth-ui-project:app-session')).toBeNull();
    });

    it('saves the user session after a successful Google popup', async () => {
        firebase.signInWithPopup.mockResolvedValue({
            user: { displayName: 'Google Player', email: 'google@example.com', photoURL: '' },
        });
        const dialog = await makeDialog();
        const google = [...dialog.querySelectorAll('button')].find((button) =>
            button.textContent?.includes('Continue with Google'),
        );
        google?.click();

        await vi.waitFor(() => {
            expect(localStorage.getItem('minigames:auth-ui-project:app-session')).not.toBeNull();
        });
        expect(
            JSON.parse(localStorage.getItem('minigames:auth-ui-project:app-session') ?? '{}'),
        ).toMatchObject({
            displayName: 'Google Player',
            email: 'google@example.com',
        });
        expect(dialog.textContent).toContain('Welcome back, Google Player!');
    });
});

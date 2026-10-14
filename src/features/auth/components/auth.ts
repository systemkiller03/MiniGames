import '../styles/auth.scss';
import { LockKeyhole, Mail, UserRound, X } from 'lucide';
import { FirebaseError } from 'firebase/app';
import { createButton, createIconButton, createSnackbar } from '@/shared/components';
import {
    createAppSession,
    registerWithEmail,
    saveAppSession,
    signInWithEmail,
    signInWithGoogle,
} from '../api/auth.api';
import { validateAuthField, type AuthFieldName } from '../utils/auth-validation';
import { createAuthField } from './auth-field';

export type AuthMode = 'login' | 'register';

function getAuthErrorMessage(error: unknown, fallbackMessage: string): string {
    if (!(error instanceof FirebaseError)) {
        return error instanceof Error && error.message ? error.message : fallbackMessage;
    }

    switch (error.code) {
        case 'auth/operation-not-allowed':
        case 'auth/admin-restricted-operation': {
            return 'Email/password authentication is disabled. Enable the Email/Password provider in Firebase Console under Authentication > Sign-in method.';
        }
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password': {
            return 'Email or password is incorrect.';
        }
        case 'auth/email-already-in-use': {
            return 'An account with this email already exists. Try signing in instead.';
        }
        case 'auth/weak-password': {
            return 'This password is too weak. Choose a stronger password and try again.';
        }
        case 'auth/invalid-email': {
            return 'Enter a valid email address.';
        }
        case 'auth/network-request-failed': {
            return 'Unable to connect to the authentication service. Check your connection and try again.';
        }
        case 'auth/too-many-requests': {
            return 'Too many attempts. Please wait a while and try again.';
        }
        default: {
            return fallbackMessage;
        }
    }
}

export function createAuthDialog(onModeChange?: (mode: AuthMode) => void): {
    dialog: HTMLDialogElement;
    setMode: (mode: AuthMode) => void;
} {
    const dialog = document.createElement('dialog');
    dialog.className = 'auth-dialog';
    dialog.setAttribute('aria-labelledby', 'auth-dialog-title');

    const close = createIconButton('Close dialog', X, {
        size: 'sm',
        shape: 'square',
    });
    const tabs = document.createElement('div');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Authentication mode');
    const loginTab = createButton({ label: 'Login', variant: 'outline', size: 'md' });
    loginTab.classList.add('auth-tab');
    loginTab.setAttribute('role', 'tab');
    loginTab.setAttribute('aria-controls', 'auth-dialog-form');
    const registerTab = createButton({ label: 'Register', variant: 'outline', size: 'md' });
    registerTab.classList.add('auth-tab');
    registerTab.setAttribute('role', 'tab');
    registerTab.setAttribute('aria-controls', 'auth-dialog-form');
    tabs.append(loginTab, registerTab);

    const title = document.createElement('h2');
    title.id = 'auth-dialog-title';
    const message = document.createElement('p');

    const form = document.createElement('form');
    form.id = 'auth-dialog-form';
    form.noValidate = true;
    form.addEventListener('submit', (event) => event.preventDefault());

    const fields = document.createElement('div');
    fields.className = 'auth-fields';

    const forgotPassword = createButton({
        label: 'Forgot Password?',
        variant: 'outline',
        size: 'sm',
    });
    forgotPassword.classList.add('auth-text-button');

    const submit = createButton({
        variant: 'primary',
        size: 'lg',
        fullWidth: true,
        type: 'submit',
        disabled: true,
    });

    const snackbar = createSnackbar();

    const divider = document.createElement('div');
    divider.className = 'auth-divider';
    divider.append(document.createElement('span'));
    const dividerLabel = document.createElement('span');
    dividerLabel.className = 'auth-divider-label';
    dividerLabel.textContent = 'OR';
    divider.append(dividerLabel, document.createElement('span'));

    const googleLabel = document.createElement('span');
    googleLabel.textContent = 'G';
    const google = createButton({
        variant: 'outline',
        size: 'lg',
        fullWidth: true,
        iconLeft: googleLabel,
    });
    google.type = 'button';
    google.append(document.createTextNode('Continue with Google'));

    const footer = document.createElement('p');

    const fieldMap = new Map<AuthFieldName, HTMLInputElement>();
    const errorMap = new Map<AuthFieldName, HTMLElement>();
    let currentMode: AuthMode = 'login';
    let isSubmitting = false;
    let footerAction: HTMLButtonElement | undefined;

    const setStatusMessage = (nextMessage: string): void => {
        message.textContent = nextMessage;
        message.classList.remove('auth-status-error');
    };

    const setStatusError = (nextMessage: string): void => {
        message.textContent = nextMessage;
        message.classList.add('auth-status-error');
    };

    const setIsSubmitting = (shouldSubmit: boolean): void => {
        isSubmitting = shouldSubmit;
        const activeFields = getCurrentFieldNames();
        for (const fieldName of activeFields) {
            const input = fieldMap.get(fieldName);
            if (input) {
                input.disabled = shouldSubmit;
            }
        }

        close.disabled = shouldSubmit;
        loginTab.disabled = shouldSubmit;
        registerTab.disabled = shouldSubmit;
        forgotPassword.disabled = shouldSubmit;
        const hasInvalidField = activeFields.some((fieldName) => {
            const input = fieldMap.get(fieldName);
            return input ? validateField(fieldName, input.value) !== '' : true;
        });
        submit.disabled = shouldSubmit || hasInvalidField;
        google.disabled = shouldSubmit;
        footerAction?.setAttribute('aria-disabled', String(shouldSubmit));
        if (footerAction) {
            footerAction.disabled = shouldSubmit;
        }

        const submitLabel = currentMode === 'login' ? 'Login' : 'Create Account';
        const pendingLabel = currentMode === 'login' ? 'Logging in...' : 'Creating account...';
        submit.textContent = shouldSubmit ? pendingLabel : submitLabel;
    };

    const updateFieldMessage = (fieldName: AuthFieldName, errorMessage: string): void => {
        const input = fieldMap.get(fieldName);
        const errorElement = errorMap.get(fieldName);

        if (!input || !errorElement) {
            return;
        }

        const hasError = Boolean(errorMessage);
        input.setAttribute('aria-invalid', String(hasError));
        input.setAttribute('aria-describedby', hasError ? `${fieldName}-error` : '');
        errorElement.textContent = errorMessage;
        errorElement.hidden = !hasError;
    };

    const getCurrentFieldNames = (): AuthFieldName[] => {
        return currentMode === 'login'
            ? ['email', 'password']
            : ['username', 'email', 'password', 'confirmPassword'];
    };

    const validateField = (fieldName: AuthFieldName, value: string): string => {
        const passwordValue = fieldMap.get('password')?.value ?? '';
        return validateAuthField(fieldName, currentMode, value, passwordValue);
    };

    const updateSubmitState = (): void => {
        const activeFields = getCurrentFieldNames();
        const hasInvalidField = activeFields.some((fieldName) => {
            const input = fieldMap.get(fieldName);
            return input ? validateField(fieldName, input.value) !== '' : true;
        });

        submit.disabled = hasInvalidField || isSubmitting;
    };

    const syncFieldValidation = (fieldName: AuthFieldName): void => {
        const input = fieldMap.get(fieldName);
        if (!input) {
            return;
        }

        const errorMessage = validateField(fieldName, input.value);
        updateFieldMessage(fieldName, errorMessage);

        if (currentMode === 'register' && fieldName === 'password') {
            const confirmInput = fieldMap.get('confirmPassword');
            if (confirmInput) {
                const confirmError = validateField('confirmPassword', confirmInput.value);
                updateFieldMessage('confirmPassword', confirmError);
            }
        }

        updateSubmitState();
    };

    const setMode = (mode: AuthMode): void => {
        currentMode = mode;
        const isLogin = mode === 'login';
        loginTab.setAttribute('aria-selected', String(isLogin));
        registerTab.setAttribute('aria-selected', String(!isLogin));
        loginTab.tabIndex = isLogin ? 0 : -1;
        registerTab.tabIndex = isLogin ? -1 : 0;
        title.textContent = isLogin ? 'Welcome Back!' : 'Create Account';
        setStatusMessage(
            isLogin
                ? 'Sign in to resume your games and progress.'
                : 'Join MiniGames to track your score & streak.',
        );
        fieldMap.clear();
        errorMap.clear();
        fields.replaceChildren(
            ...(isLogin
                ? [
                      createAuthField(
                          'Email Address',
                          'email',
                          'e.g. alex@minigames.com',
                          Mail,
                          'email',
                      ),
                      createAuthField('Password', 'password', '••••••••', LockKeyhole, 'password'),
                  ]
                : [
                      createAuthField(
                          'Username',
                          'text',
                          'e.g. CozyGamer99',
                          UserRound,
                          'username',
                      ),
                      createAuthField(
                          'Email Address',
                          'email',
                          'your.email@domain.com',
                          Mail,
                          'email',
                      ),
                      createAuthField(
                          'Password',
                          'password',
                          'Min. 8 characters',
                          LockKeyhole,
                          'password',
                      ),
                      createAuthField(
                          'Confirm Password',
                          'password',
                          'Repeat your password',
                          LockKeyhole,
                          'confirmPassword',
                      ),
                  ]),
        );

        const fieldElements = fields.querySelectorAll<HTMLInputElement>('[data-auth-field]');
        for (const input of fieldElements) {
            const fieldName = input.dataset.authField as AuthFieldName;
            const errorElement = input
                .closest('label')
                ?.querySelector<HTMLElement>('.auth-field-error');

            if (!fieldName || !errorElement) {
                continue;
            }

            fieldMap.set(fieldName, input);
            errorMap.set(fieldName, errorElement);
            input.setAttribute('aria-invalid', 'false');
            input.setAttribute('aria-describedby', `${fieldName}-error`);
            input.addEventListener('input', () => syncFieldValidation(fieldName));
            input.addEventListener('change', () => syncFieldValidation(fieldName));
            input.addEventListener('blur', () => syncFieldValidation(fieldName));
        }

        forgotPassword.hidden = !isLogin;
        submit.textContent = isLogin ? 'Login' : 'Create Account';
        footer.textContent = isLogin ? "Don't have an account? " : 'Already have an account? ';
        footer.replaceChildren();

        footerAction = createButton({
            label: isLogin ? 'Register' : 'Login',
            variant: 'outline',
            size: 'sm',
            disabled: isSubmitting,
        });
        footerAction.classList.add('auth-text-button');
        footerAction.addEventListener('click', () => {
            if (!isSubmitting) {
                selectMode(isLogin ? 'register' : 'login');
            }
        });
        footer.append(footerAction);
        updateSubmitState();
    };

    const selectMode = (mode: AuthMode): void => {
        if (mode === currentMode) {
            return;
        }

        setMode(mode);
        onModeChange?.(mode);
    };

    const submitAuth = async (event: SubmitEvent): Promise<void> => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const activeFields = getCurrentFieldNames();
        const invalidField = activeFields.find((fieldName) => {
            const input = fieldMap.get(fieldName);
            return input ? validateField(fieldName, input.value) !== '' : true;
        });

        if (invalidField) {
            const input = fieldMap.get(invalidField);
            if (input) {
                syncFieldValidation(invalidField);
                input.focus();
            }
            return;
        }

        const email = fieldMap.get('email')?.value.trim() ?? '';
        const password = fieldMap.get('password')?.value ?? '';
        const username = fieldMap.get('username')?.value.trim() ?? '';

        try {
            setIsSubmitting(true);
            setStatusMessage(
                currentMode === 'login' ? 'Signing you in...' : 'Creating your profile...',
            );

            const user =
                currentMode === 'login'
                    ? await signInWithEmail(email, password)
                    : await registerWithEmail(username, email, password);

            const session = createAppSession(user.user);
            saveAppSession(session);
            snackbar.show(
                currentMode === 'login'
                    ? `Welcome back, ${session.displayName}!`
                    : `Account created for ${session.displayName}.`,
                'success',
            );
            dialog.close();
        } catch (error) {
            const fallbackMessage =
                currentMode === 'login'
                    ? 'Unable to sign in. Please check your details and try again.'
                    : 'Unable to create your account. Please try again.';

            const errorMessage = getAuthErrorMessage(error, fallbackMessage);

            setStatusError(errorMessage);
            snackbar.show(errorMessage || fallbackMessage, 'error');
        } finally {
            setIsSubmitting(false);
            updateSubmitState();
        }
    };

    const submitGoogleAuth = async (): Promise<void> => {
        if (isSubmitting) {
            return;
        }

        try {
            setIsSubmitting(true);
            setStatusMessage('Connecting to Google...');

            const user = await signInWithGoogle();
            const session = createAppSession(user.user);
            saveAppSession(session);
            snackbar.show(`Welcome back, ${session.displayName}!`, 'success');
            dialog.close();
        } catch (error) {
            const fallbackMessage = 'Google sign-in was canceled or failed. Please try again.';
            const errorMessage = getAuthErrorMessage(error, fallbackMessage);

            setStatusError(errorMessage || fallbackMessage);
            snackbar.show(errorMessage || fallbackMessage, 'error');
        } finally {
            setIsSubmitting(false);
            updateSubmitState();
        }
    };

    close.addEventListener('click', () => {
        if (!isSubmitting) {
            dialog.close();
        }
    });
    dialog.addEventListener('cancel', (event) => {
        if (isSubmitting) {
            event.preventDefault();
        }
    });
    dialog.addEventListener('click', (event) => {
        if (isSubmitting && event.target === dialog) {
            event.preventDefault();
        }
    });
    dialog.addEventListener('keydown', (event) => {
        if (isSubmitting && event.key === 'Escape') {
            event.preventDefault();
        }
    });
    google.addEventListener('click', () => {
        void submitGoogleAuth();
    });
    form.addEventListener('submit', submitAuth);
    loginTab.addEventListener('click', () => selectMode('login'));
    registerTab.addEventListener('click', () => selectMode('register'));
    loginTab.setAttribute('aria-label', 'Show login form');
    registerTab.setAttribute('aria-label', 'Show registration form');
    dialog.append(close, tabs, title, message, form, snackbar.element);
    form.append(fields, forgotPassword, submit, divider, google, footer);
    setMode('login');
    return { dialog, setMode };
}

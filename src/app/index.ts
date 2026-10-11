import { createAuthDialog } from '@/features/auth/components/auth';
import { createFooter } from '@/features/footer/footer';
import { createHeader } from '@/features/header/header';
import {
    getAppSession,
    initializeAppSession,
    signOutAppSession,
} from '@/features/auth/api/auth.api';
import { createSnackbar } from '@/shared/components';
import {
    readRouteState,
    clearAuthParameterFromUrl,
    updateRouteState,
} from '@/shared/utils/navigation';

export function createApp() {
    const body = document.body;
    const sessionSnackbar = createSnackbar();
    body.append(sessionSnackbar.element);
    let isLoggingOut = false;
    body.addEventListener('click', (event: MouseEvent) => {
        const target =
            event.target instanceof Element
                ? event.target.closest('[data-auth-action="logout"]')
                : undefined;
        if (isLoggingOut || !(target instanceof HTMLButtonElement)) {
            return;
        }

        event.preventDefault();
        isLoggingOut = true;
        sessionSnackbar.show('Signing out…', 'loading');
        void signOutAppSession()
            .then(() => {
                sessionSnackbar.show('You have signed out.', 'success');
            })
            .catch(() => {
                sessionSnackbar.show(
                    'You are in Guest Mode, but sign-out could not be completed with the authentication service.',
                    'error',
                );
            })
            .finally(() => {
                isLoggingOut = false;
            });
    });
    globalThis.addEventListener('app-session-expired', () => {
        sessionSnackbar.show('Your session has expired. Please sign in again.', 'error');
    });
    initializeAppSession();

    body.append(createHeader());
    const main = document.createElement('main');
    body.append(main);
    body.append(createFooter());

    const authDialog = createAuthDialog((mode) => {
        requestAuth(mode);
    });
    body.append(authDialog.dialog);
    let isProtectedAuthPending = false;

    const blockAuthenticatedAuth = (): void => {
        clearAuthParameterFromUrl();
        isProtectedAuthPending = false;
        if (authDialog.dialog.open) {
            authDialog.dialog.close();
        }
        sessionSnackbar.show('You are already signed in.', 'success');
    };

    const syncAuthDialog = (): void => {
        const session = getAppSession();
        const currentRoute = readRouteState();
        if (currentRoute.auth === 'login' || currentRoute.auth === 'register') {
            if (session) {
                blockAuthenticatedAuth();
                return;
            }
            authDialog.setMode(currentRoute.auth);
            if (!authDialog.dialog.open) {
                if (typeof authDialog.dialog.showModal === 'function') {
                    authDialog.dialog.showModal();
                } else {
                    authDialog.dialog.setAttribute('open', 'open');
                }
            }
            return;
        }

        if (authDialog.dialog.open) {
            authDialog.dialog.close();
        }
    };

    globalThis.addEventListener('app-auth-required', (event: Event) => {
        const detail = (event as CustomEvent<{ reason?: 'favorite' | 'comment-like' }>).detail;
        isProtectedAuthPending = true;
        syncAuthDialog();

        if (detail?.reason === 'favorite') {
            sessionSnackbar.show('Please sign in to save favorites.', 'error');
        }
        if (detail?.reason === 'comment-like') {
            sessionSnackbar.show('Please sign in to like comments.', 'error');
        }
    });

    const requestAuth = (mode: 'login' | 'register'): void => {
        if (getAppSession()) {
            blockAuthenticatedAuth();
            return;
        }

        const currentRoute = readRouteState();
        updateRouteState({
            page: currentRoute.page,
            category: currentRoute.category,
            sort: currentRoute.sort,
            pageNumber: currentRoute.pageNumber,
            game: currentRoute.game ?? undefined,
            auth: mode,
        });
        syncAuthDialog();
    };

    body.addEventListener('click', (event: MouseEvent) => {
        const target =
            event.target instanceof Element
                ? event.target.closest('[data-auth-action]')
                : undefined;
        if (!(target instanceof HTMLElement)) {
            return;
        }

        const authAction = target.dataset.authAction;
        if (isLoggingOut || authAction === 'logout') {
            return;
        }
        const mode = authAction === 'signup' ? 'register' : 'login';
        requestAuth(mode);
    });

    authDialog.dialog.addEventListener('close', () => {
        getAppSession();
        clearAuthParameterFromUrl();
        if (!isProtectedAuthPending) {
            return;
        }
        isProtectedAuthPending = false;
        globalThis.dispatchEvent(new Event('app-auth-completed'));
    });

    globalThis.addEventListener('app-route-changed', syncAuthDialog);
    syncAuthDialog();

    return main;
}

import { createAuthDialog } from '@/features/auth/auth';
import { createFooter } from '@/features/footer/footer';
import { createHeader } from '@/features/header/header';
import { readRouteState, updateRouteState } from '@/shared/utils/navigation';

export function createApp() {
    const body = document.body;
    body.append(createHeader());
    const main = document.createElement('main');
    body.append(main);
    body.append(createFooter());

    const authDialog = createAuthDialog((mode) => {
        updateRouteState({ auth: mode });
    });
    body.append(authDialog.dialog);

    const syncAuthDialog = (): void => {
        const currentRoute = readRouteState();
        if (currentRoute.auth === 'login' || currentRoute.auth === 'register') {
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

    body.addEventListener('click', (event: MouseEvent) => {
        const target =
            event.target instanceof Element
                ? (event.target.closest('[data-auth-action]') ?? undefined)
                : undefined;
        if (!target) {
            return;
        }

        const authAction = target.dataset.authAction;
        const mode = authAction === 'signup' ? 'register' : 'login';
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
    });

    authDialog.dialog.addEventListener('close', () => {
        const currentRoute = readRouteState();
        if (currentRoute.auth) {
            updateRouteState({
                page: currentRoute.page,
                category: currentRoute.category,
                sort: currentRoute.sort,
                pageNumber: currentRoute.pageNumber,
                game: currentRoute.game ?? undefined,
                auth: undefined,
            });
        }
    });

    globalThis.addEventListener('popstate', syncAuthDialog);
    syncAuthDialog();

    return main;
}

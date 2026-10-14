import { getAppSession } from '@/features/auth/api/auth.api';
import { createButton, createIconButton } from '@/shared/components';
import { getNavigationUrl, readRouteState } from '@/shared/utils/navigation';
import logoIconSrc from '@/assets/Logo.svg';
import { X } from 'lucide';
import './mobile-burger.scss';

export type NAV_ELEM = { name: string; link: string };
const NAV_ELEMS: NAV_ELEM[] = [
    {
        name: 'Home',
        link: '/',
    },
    {
        name: 'Library',
        link: '/library',
    },
    {
        name: 'Tournaments',
        link: '/',
    },
    {
        name: 'Community',
        link: '/',
    },
];

export function createMobileBurger() {
    const aside = document.createElement('aside');
    aside.className = 'mobile-menu';
    aside.hidden = true;

    const firstLine = document.createElement('div');
    firstLine.className = 'mobile-menu__header';
    const logo = document.createElement('div');
    logo.className = 'mobile-menu__brand';

    const icon: HTMLImageElement = document.createElement('img');
    icon.src = logoIconSrc;
    icon.alt = 'Logo icon';

    const h1 = document.createElement('h1');
    h1.textContent = 'MiniGames';

    logo.append(icon);
    logo.append(h1);
    firstLine.append(logo);
    const closeButton = createIconButton('Close menu', X, {
        size: 'sm',
        shape: 'square',
        tone: 'dark',
    });

    closeButton.addEventListener('click', () => {
        aside.hidden = true;
    });
    firstLine.append(closeButton);

    aside.append(firstLine);

    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    const updateActiveLink = (): void => {
        const currentPage = readRouteState().page;
        for (const link of ul.querySelectorAll('a')) {
            const isCurrentPage = link.dataset.route === currentPage;
            if (isCurrentPage) {
                link.setAttribute('aria-current', 'page');
            } else {
                link.toggleAttribute('aria-current', false);
            }
        }
    };
    for (const element of NAV_ELEMS) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = element.name;
        a.href = getNavigationUrl(element.link);
        a.dataset.route = element.link;
        li.append(a);
        ul.append(li);
    }
    updateActiveLink();
    globalThis.addEventListener('app-route-changed', updateActiveLink);
    nav.append(ul);

    const actions = document.createElement('div');
    actions.className = 'mobile-menu__actions';

    const renderAuthActions = (): void => {
        actions.replaceChildren();
        const session = getAppSession();

        if (session) {
            const logout = createButton({
                label: 'Log Out',
                variant: 'outline-inverse',
                size: 'sm',
                fullWidth: true,
            });
            logout.dataset.authAction = 'logout';
            actions.append(logout);
            return;
        }

        const login = createButton({
            label: 'Log In',
            variant: 'outline-inverse',
            size: 'md',
            fullWidth: true,
        });
        login.dataset.authAction = 'login';
        actions.append(login);

        const signup = createButton({
            label: 'Sign Up',
            variant: 'primary',
            size: 'md',
            fullWidth: true,
        });
        signup.dataset.authAction = 'signup';
        actions.append(signup);
    };

    renderAuthActions();
    globalThis.addEventListener('app-session-updated', renderAuthActions);

    nav.append(actions);
    aside.append(nav);
    return aside;
}

import logoIconSrc from '@/assets/Logo.svg';
import { getAppSession } from '@/features/auth/api/auth.api';
import { createButton, createIconButton } from '@/shared/components';
import { getNavigationUrl, readRouteState } from '@/shared/utils/navigation';
import './header.scss';
import { Menu } from 'lucide';
import { createMobileBurger } from './mobile-burger';
import { createProfileState } from './profile';

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

export function createHeader() {
    const header = document.createElement('header');
    header.className = 'site-header';

    const logo = document.createElement('div');

    const icon: HTMLImageElement = document.createElement('img');
    icon.src = logoIconSrc;
    icon.alt = 'Logo icon';

    const h1 = document.createElement('h1');
    h1.textContent = 'MiniGames';

    logo.append(icon);
    logo.append(h1);
    header.append(logo);

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
    actions.className = 'site-header__actions';

    const authActions = document.createElement('div');
    authActions.className = 'site-header__auth-actions';

    const renderAuthActions = (): void => {
        authActions.replaceChildren();
        const session = getAppSession();

        if (session) {
            authActions.append(createProfileState(session));
            return;
        }

        const login = createButton({ label: 'Log In', variant: 'outline', size: 'md' });
        login.dataset.authAction = 'login';
        authActions.append(login);

        const signup = createButton({ label: 'Sign Up', variant: 'primary', size: 'md' });
        signup.dataset.authAction = 'signup';
        authActions.append(signup);
    };

    renderAuthActions();
    globalThis.addEventListener('app-session-updated', renderAuthActions);

    const aside = createMobileBurger();

    const mobileBurgerButton = createIconButton('Open menu', Menu, {
        size: 'sm',
        shape: 'square',
    });
    mobileBurgerButton.dataset.mobileMenuToggle = '';
    mobileBurgerButton.addEventListener('click', () => {
        aside.hidden = false;
    });

    actions.append(authActions);
    actions.append(mobileBurgerButton);

    nav.append(actions);

    header.append(nav);
    header.append(aside);

    return header;
}

import logoIconSrc from '@/assets/Logo.svg';
import { createButton, createIconButton } from '@/shared/components';
import { getNavigationUrl } from '@/shared/utils/navigation';
import './header.scss';
import { Menu } from 'lucide';
import { createMobileBurger } from './mobile-burger';

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
    for (const element of NAV_ELEMS) {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = element.name;
        a.href = getNavigationUrl(element.link);
        li.append(a);
        ul.append(li);
    }
    nav.append(ul);

    const div = document.createElement('div');
    const login = createButton({ label: 'Log In', variant: 'outline', size: 'md' });
    login.dataset.authAction = 'login';
    div.append(login);

    const signup = createButton({ label: 'Sign Up', variant: 'primary', size: 'md' });
    signup.dataset.authAction = 'signup';
    div.append(signup);

    const mobileBurgerButton = createIconButton('Open menu', Menu, {
        size: 'sm',
        shape: 'square',
    });
    mobileBurgerButton.dataset.mobileMenuToggle = '';

    mobileBurgerButton.addEventListener('click', () => {
        aside.hidden = false;
    });

    div.append(mobileBurgerButton);

    nav.append(div);

    header.append(nav);

    const aside = createMobileBurger();
    header.append(aside);

    return header;
}

import logoIconSrc from '@/assets/Logo.svg';
import { createButton, createIconButton } from '@/shared/components';
import { getNavigationUrl } from '@/shared/navigation';
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
    const logo = document.createElement('div');

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
    const login = createButton({
        label: 'Log In',
        variant: 'outline-inverse',
        size: 'md',
        fullWidth: true,
    });
    login.dataset.authAction = 'login';
    div.append(login);

    const signup = createButton({
        label: 'Sign Up',
        variant: 'primary',
        size: 'md',
        fullWidth: true,
    });
    div.append(signup);

    nav.append(div);
    aside.append(nav);
    return aside;
}

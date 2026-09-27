import logoIconSrc from'@/assets/Logo.svg';
import{ createButton } from'@/shared/components/button/button';
import{ createElement, X } from'lucide';
import'./mobile-burger.scss';
export type NAV_ELEM = { name: string; link: string };
const NAV_ELEMS: NAV_ELEM[] = [
    {
        name: 'Home',
        link: '/',
    },
    {
        name: 'Library',
        link: '/',
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
export function createMobileBurger(){
    const aside = document.createElement('aside');
    aside.classList.add('closed');

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
    const closeButton = createButton({ icon: createElement(X), variant: 'outline' });
    closeButton.classList.add('closeButton');

    closeButton.addEventListener('click', () => {
        aside.classList.add('closed');
    });
    firstLine.append(closeButton);

    aside.append(firstLine);

    const nav = document.createElement('nav');
    const ul = document.createElement('ul');
    for(const element of NAV_ELEMS){
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.textContent = element.name;
        a.href = element.link;
        li.append(a);
        ul.append(li);
    }
    nav.append(ul);

    const div = document.createElement('div');
    const login = createButton({ label: 'Log In', variant: 'outline' });
    login.classList.add('login');
    div.append(login);

    const signup = createButton({ label: 'Sign Up', variant: 'primary' });
    signup.classList.add('signup');
    div.append(signup);

    nav.append(div);
    aside.append(nav);
    return aside;
}

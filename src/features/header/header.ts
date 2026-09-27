import logoIconSrc from'@/assets/Logo.svg';
import{ createButton } from'@/shared/components/button/button';
import'./header.scss';
import{ createElement, Menu } from'lucide';
import{ createMobileBurger } from'./mobile-burger';

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
export function createHeader(){
    const header = document.createElement('header');

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

    const mobileBurgerButton = createButton({ icon: createElement(Menu), variant: 'outline' });
    mobileBurgerButton.classList.add('mobileBurgerButton');

    mobileBurgerButton.addEventListener('click', () => {
        aside.classList.remove('closed');
    });

    div.append(mobileBurgerButton);

    nav.append(div);

    header.append(nav);

    const aside = createMobileBurger();
    header.append(aside);

    return header;
}

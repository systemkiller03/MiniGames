import logoIconSrc from'@/assets/Logo.svg';
import{ createButton } from'@/shared/components/button/button';
import'./header.scss';

const NAV_ELEMS: { name: string; link: string }[] = [
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
    const login = createButton('Log In', 'outline');
    login.classList.add('login');
    div.append(login);

    const signup = createButton('Sign Up', 'primary');
    signup.classList.add('signup');
    div.append(signup);

    nav.append(div);

    header.append(nav);
    return header;
}

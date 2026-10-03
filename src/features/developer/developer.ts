import './developer.scss';
import illustration from '../../assets/illustration-side.png';
import { createElement, Upload } from 'lucide';
import { createButton } from '../../shared/components';

export function createDeveloperSection(): HTMLElement {
    const section = document.createElement('section');
    section.className = 'developer';
    section.setAttribute('aria-labelledby', 'developer-title');

    const illustrationElement = document.createElement('img');
    illustrationElement.src = illustration;
    illustrationElement.alt = 'A game developer working at a computer';

    const content = document.createElement('div');
    const title = document.createElement('h2');
    title.id = 'developer-title';
    title.textContent = 'Are You a Game Developer?';

    const description = document.createElement('p');
    description.textContent =
        "Want to see your game on MiniGames? We're always looking for fun, engaging mini games to add to our platform. Submit your game and reach thousands of players!";

    const button = createButton({
        label: 'Submit Form',
        icon: createElement(Upload),
        variant: 'primary',
        size: 'sm',
    });
    button.classList.add('developer-cta');

    const contact = document.createElement('p');
    contact.append('or contact us at ');
    const email = document.createElement('a');
    email.href = 'mailto:developers@minigames.com';
    email.textContent = 'developers@minigames.com';
    contact.append(email);

    content.append(title, description, button, contact);

    section.append(illustrationElement, content);
    return section;
}

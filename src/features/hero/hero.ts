import './hero.scss';
import heroImage from '../../assets/hero-section.png';
import { createButton } from '../../shared/components';
import { getNavigationUrl } from '@/shared/navigation';

export function createHero(): HTMLElement {
    const hero = document.createElement('section');
    hero.className = 'hero';
    hero.setAttribute('aria-labelledby', 'hero-title');
    hero.style.setProperty('--hero-image', `url(${heroImage})`);

    const content = document.createElement('div');

    const title = document.createElement('h1');
    title.id = 'hero-title';
    title.textContent = 'Take a Short Break & Have Fun';

    const description = document.createElement('p');
    description.textContent =
        'Discover hundreds of curated casual mini-games. Play instantly in your browser - puzzle, match 3, farm, and board classics.';

    const button = createButton({ label: 'Browse Library', variant: 'primary', size: 'md' });
    button.addEventListener('click', () => {
        globalThis.location.assign(getNavigationUrl('/library'));
    });
    content.append(title, description, button);
    hero.append(content);
    return hero;
}

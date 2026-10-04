import './home.scss';
import { createCarousel } from '../../features/carousel';
import { createDeveloperSection } from '../../features/developer/developer';
import { createHero } from '../../features/hero/hero';
import { createLeaderboard } from '../../features/leaderboard';

export function createHomePage(): HTMLElement {
    const page = document.createElement('div');
    page.className = 'home-page';
    page.append(createHero(), createCarousel(), createLeaderboard(), createDeveloperSection());
    return page;
}

import{ createCarousel } from'../../features/carousel/carousel';
import{ createDeveloperSection } from'../../features/developer/developer';
import{ createHero } from'../../features/hero/hero';
import{ createLeaderboard } from'../../features/leaderboard/leaderboard';

export function createHomePage(): HTMLElement{
    const page = document.createElement('main');
    page.className = 'home-page';
    page.append(createHero(), createCarousel(), createLeaderboard(), createDeveloperSection());
    return page;
}

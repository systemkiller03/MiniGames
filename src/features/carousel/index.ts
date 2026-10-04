import './styles/carousel.scss';
import { renderCarouselGames } from './components/carousel';
import { createEmptyState } from './components/empty';
import { createErrorState } from './components/error';
import { createCarouselLayout } from './components/layout';
import { createLoadingState } from './components/loading';
import { getFeaturedGames } from './api/carousel.api';

export function createCarousel(): HTMLElement {
    const layout = createCarouselLayout();

    const snackbar = document.createElement('div');
    snackbar.className = 'carousel-snackbar';
    snackbar.setAttribute('role', 'status');
    snackbar.setAttribute('aria-live', 'polite');

    const loadFeaturedGames = async (): Promise<void> => {
        layout.controls.hidden = true;
        layout.indicators.hidden = true;
        layout.indicators.replaceChildren();
        layout.viewport.replaceChildren(createLoadingState());

        try {
            const games = await getFeaturedGames();
            if (games.length === 0) {
                layout.viewport.replaceChildren(createEmptyState());
                return;
            }
            renderCarouselGames(games, layout);
        } catch {
            snackbar.textContent = 'Unable to load featured games. Please try again.';
            snackbar.dataset.variant = 'error';
            snackbar.classList.add('is-visible');
            globalThis.setTimeout(() => snackbar.classList.remove('is-visible'), 3200);
            layout.viewport.replaceChildren(createErrorState(() => void loadFeaturedGames()));
        }
    };

    layout.element.append(snackbar);
    void loadFeaturedGames();
    return layout.element;
}

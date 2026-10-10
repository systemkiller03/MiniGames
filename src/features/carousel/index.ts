import './styles/carousel.scss';
import { renderCarouselGames } from './components/carousel';
import { createEmptyState } from './components/empty';
import { createErrorState } from './components/error';
import { createCarouselLayout } from './components/layout';
import { createLoadingState } from './components/loading';
import { getFeaturedGames } from './api/carousel.api';
import { createSnackbar } from '@/shared/components';

export function createCarousel(): HTMLElement {
    const layout = createCarouselLayout();
    const snackbar = createSnackbar();

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
            snackbar.show('Unable to load featured games. Please try again.', 'error');
            layout.viewport.replaceChildren(createErrorState(() => void loadFeaturedGames()));
        }
    };

    layout.element.append(snackbar.element);
    void loadFeaturedGames();
    return layout.element;
}

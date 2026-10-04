import { ArrowLeft, ArrowRight } from 'lucide';
import { createIconButton } from '@/shared/components';

export type CarouselLayout = {
    element: HTMLElement;
    controls: HTMLElement;
    viewport: HTMLElement;
    previousButton: HTMLButtonElement;
    nextButton: HTMLButtonElement;
    indicators: HTMLElement;
};

export function createCarouselLayout(): CarouselLayout {
    const element = document.createElement('section');
    element.className = 'carousel';
    element.setAttribute('aria-labelledby', 'carousel-title');

    const heading = document.createElement('header');
    heading.className = 'carousel-header';
    const title = document.createElement('h2');
    title.id = 'carousel-title';
    title.textContent = 'New Games';

    const controls = document.createElement('div');
    controls.className = 'carousel-controls';
    controls.hidden = true;
    const previousButton = createIconButton('Previous games', ArrowLeft, {
        size: 'sm',
        shape: 'circle',
        variant: 'surface',
    });
    previousButton.dataset.direction = 'previous';
    const nextButton = createIconButton('Next games', ArrowRight, {
        size: 'sm',
        shape: 'circle',
        variant: 'surface',
    });
    nextButton.dataset.direction = 'next';
    controls.append(previousButton, nextButton);
    heading.append(title, controls);

    const viewport = document.createElement('div');
    viewport.className = 'carousel-viewport';
    viewport.dataset.carouselViewport = '';
    viewport.setAttribute('aria-label', 'Featured games slider');

    const indicators = document.createElement('nav');
    indicators.className = 'carousel-indicators';
    indicators.setAttribute('aria-label', 'Choose featured game');
    indicators.hidden = true;

    element.append(heading, viewport, indicators);
    return { element, controls, viewport, previousButton, nextButton, indicators };
}

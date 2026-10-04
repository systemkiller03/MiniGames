import { createGameDialog, type GameDialogData } from '../../game-dialog/game-dialog';
import type { ApiFeaturedGame } from '../api/carousel.api';
import type { CarouselLayout } from './layout';
import { createButton } from '@/shared/components';

const CARD_IMAGES = import.meta.glob<string>('/src/assets/*-card.jpg', {
    eager: true,
    import: 'default',
});
const HERO_IMAGES = import.meta.glob<string>('/src/assets/*-hero.jpg', {
    eager: true,
    import: 'default',
});

type SliderGame = GameDialogData & { slug: string; cardImage: string };
type CardSlot = 'peek' | 'side' | 'featured';

const AUTOPLAY_INTERVAL = 4000;
const VISIBLE_OFFSETS = [-2, -1, 0, 1, 2] as const;
const CARD_SLOTS: CardSlot[] = ['peek', 'side', 'featured', 'side', 'peek'];

function createMetadata(game: SliderGame): HTMLElement {
    const metadata = document.createElement('div');
    const rating = document.createElement('span');
    rating.dataset.stat = 'rating';
    rating.setAttribute('aria-label', `${game.rating.toFixed(1)} out of 5 stars`);
    rating.textContent = `★ ${game.rating.toFixed(1)}`;

    const likes = document.createElement('span');
    likes.dataset.stat = 'likes';
    likes.setAttribute('aria-label', `${game.likes.toLocaleString()} likes`);
    likes.textContent = `♥ ${game.likes.toLocaleString()}`;
    metadata.append(rating, likes);
    return metadata;
}

function createGameCard(game: SliderGame, openGame: () => void): HTMLElement {
    const card = document.createElement('article');
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.dataset.gameSlug = game.slug;
    card.setAttribute('aria-label', `Open details for ${game.title}`);

    const image = document.createElement('img');
    image.src = game.cardImage;
    image.alt = game.title;
    const info = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = game.title;
    title.title = game.title;
    info.append(title, createMetadata(game));
    card.append(image, info);

    card.addEventListener('click', openGame);
    card.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openGame();
    });
    return card;
}

export function renderCarouselGames(
    featuredGames: ApiFeaturedGame[],
    layout: CarouselLayout,
): void {
    const games: SliderGame[] = featuredGames.map((game) => {
        const cardFilename = game.cardImage.split('/').at(-1);
        const cardImage = cardFilename ? CARD_IMAGES[`/src/assets/${cardFilename}`] : undefined;
        if (!cardImage) {
            throw new Error(`Local card image not found for ${game.slug}`);
        }

        return {
            slug: game.slug,
            cardImage,
            image: HERO_IMAGES[`/src/assets/${game.slug}-hero.jpg`] ?? cardImage,
            title: game.name,
            category: game.category.charAt(0).toUpperCase() + game.category.slice(1),
            price: game.price,
            rating: Number(game.rating),
            likes: Number(game.likesCount),
            description: game.shortDescription,
            tags: [],
            players: 'Solo',
            duration: '40-90 min',
            mode: 'Desktop',
        };
    });

    layout.controls.hidden = false;
    layout.indicators.hidden = false;
    const track = document.createElement('div');
    track.dataset.track = '';
    layout.viewport.replaceChildren(track);

    const dialog = createGameDialog();
    layout.element.append(dialog.dialog);
    const cards = new Map<string, HTMLElement>();
    let currentIndex = 0;
    let autoplayTimer: number | undefined;
    let remainingDuration = AUTOPLAY_INTERVAL;
    let autoplayDeadline = 0;
    let isAutoplayPaused = false;
    let pointerStartX: number | undefined;
    let pointerStartY = 0;
    let activePointerId: number | undefined;
    let suppressCardClickUntil = 0;

    function pauseAutoplay(): void {
        if (isAutoplayPaused) return;
        isAutoplayPaused = true;
        if (autoplayTimer === undefined) return;
        globalThis.clearTimeout(autoplayTimer);
        autoplayTimer = undefined;
        remainingDuration = Math.max(0, autoplayDeadline - performance.now());
    }

    function scheduleAutoplay(): void {
        if (isAutoplayPaused || games.length <= 1) return;
        if (autoplayTimer !== undefined) globalThis.clearTimeout(autoplayTimer);
        autoplayDeadline = performance.now() + remainingDuration;
        autoplayTimer = globalThis.setTimeout(() => {
            autoplayTimer = undefined;
            advance(1);
        }, remainingDuration);
    }

    function resumeAutoplay(): void {
        if (!isAutoplayPaused) return;
        isAutoplayPaused = false;
        scheduleAutoplay();
    }

    function renderCards(shouldAnimate = false): void {
        const previousRects = new Map<HTMLElement, DOMRect>();
        if (shouldAnimate) {
            for (const card of track.children) {
                if (card instanceof HTMLElement && !card.hidden) {
                    previousRects.set(card, card.getBoundingClientRect());
                }
            }
        }

        const visibleGames = VISIBLE_OFFSETS.map((offset, position) => ({
            game: games[(currentIndex + offset + games.length) % games.length],
            slot: CARD_SLOTS[position],
        }));
        const visibleSlugs = new Set(visibleGames.map(({ game }) => game.slug));
        const visibleCards = visibleGames.map(({ game, slot }) => {
            let card = cards.get(game.slug);
            if (!card) {
                card = createGameCard(game, () => {
                    if (Date.now() < suppressCardClickUntil) return;
                    pauseAutoplay();
                    dialog.setGame(game);
                    dialog.open();
                });
                cards.set(game.slug, card);
            }
            card.dataset.slot = slot;
            card.hidden = false;
            card.removeAttribute('aria-hidden');
            return card;
        });
        const hiddenCards = games
            .filter((game) => !visibleSlugs.has(game.slug))
            .map((game) => {
                let card = cards.get(game.slug);
                if (!card) {
                    card = createGameCard(game, () => {
                        pauseAutoplay();
                        dialog.setGame(game);
                        dialog.open();
                    });
                    cards.set(game.slug, card);
                }
                card.hidden = true;
                card.setAttribute('aria-hidden', 'true');
                return card;
            });

        track.replaceChildren(...visibleCards, ...hiddenCards);
        layout.element.dataset.currentIndex = String(currentIndex);
        layout.element.dataset.currentGame = games[currentIndex].slug;

        if (shouldAnimate && !globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            for (const card of visibleCards) {
                const previousRect = previousRects.get(card);
                if (!previousRect) continue;
                const offsetX = previousRect.left - card.getBoundingClientRect().left;
                if (Math.abs(offsetX) < 1) continue;
                card.animate(
                    [{ transform: `translateX(${offsetX}px)` }, { transform: 'translateX(0)' }],
                    { duration: 350, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
                );
            }
        }

        for (const [gameIndex, indicator] of [...layout.indicators.children].entries()) {
            indicator.setAttribute('aria-current', gameIndex === currentIndex ? 'true' : 'false');
        }
    }

    function advance(direction: 1 | -1): void {
        currentIndex = (currentIndex + direction + games.length) % games.length;
        remainingDuration = AUTOPLAY_INTERVAL;
        renderCards(true);
        scheduleAutoplay();
    }

    layout.indicators.replaceChildren(
        ...games.map((game, gameIndex) => {
            const indicator = createButton({ variant: 'primary', size: 'sm' });
            indicator.classList.add('carousel-indicator');
            indicator.setAttribute('aria-label', `Show ${game.title} in center`);
            indicator.addEventListener('click', () => {
                currentIndex = gameIndex;
                remainingDuration = AUTOPLAY_INTERVAL;
                renderCards(true);
                scheduleAutoplay();
            });
            return indicator;
        }),
    );

    function finishPointer(event: PointerEvent): void {
        if (pointerStartX === undefined || event.pointerId !== activePointerId) return;
        const deltaX = event.clientX - pointerStartX;
        const deltaY = event.clientY - pointerStartY;
        pointerStartX = undefined;
        activePointerId = undefined;
        delete layout.viewport.dataset.pressed;

        if (Math.abs(deltaX) >= 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
            suppressCardClickUntil = Date.now() + 500;
            advance(deltaX < 0 ? 1 : -1);
        }
        resumeAutoplay();
    }

    layout.viewport.addEventListener('pointerdown', (event: PointerEvent) => {
        if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        activePointerId = event.pointerId;
        layout.viewport.dataset.pressed = 'true';
        pauseAutoplay();
    });
    globalThis.addEventListener('pointerup', finishPointer);
    globalThis.addEventListener('pointercancel', finishPointer);
    layout.previousButton.addEventListener('click', () => advance(-1));
    layout.nextButton.addEventListener('click', () => advance(1));
    dialog.dialog.addEventListener('close', resumeAutoplay);

    renderCards();
    scheduleAutoplay();
}

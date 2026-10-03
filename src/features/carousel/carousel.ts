import './carousel.scss';
import { ArrowLeft, ArrowRight } from 'lucide';
import vacationCafeCard from '../../assets/vacation-cafe-simulator-card.jpg';
import vacationCafeHero from '../../assets/vacation-cafe-simulator-hero.jpg';
import winterBurrowCard from '../../assets/winter-burrow-card.jpg';
import winterBurrowHero from '../../assets/winter-burrow-hero.jpg';
import shelvePotionsCard from '../../assets/shelve-the-potions-card.jpg';
import shelvePotionsHero from '../../assets/shelve-the-potions-hero.jpg';
import heartopiaCard from '../../assets/heartopia-card.jpg';
import heartopiaHero from '../../assets/heartopia-hero.jpg';
import paliaCard from '../../assets/palia-card.jpg';
import paliaHero from '../../assets/palia-hero.jpg';
import catMailCard from '../../assets/cat-mail-co-card.jpg';
import catMailHero from '../../assets/cat-mail-co-hero.jpg';
import tinyGladeCard from '../../assets/tiny-glade-card.jpg';
import tinyGladeHero from '../../assets/tiny-glade-hero.jpg';
import tailsideCard from '../../assets/tailside-cozy-cafe-sim-card.jpg';
import tailsideHero from '../../assets/tailside-cozy-cafe-sim-hero.jpg';
import islandersCard from '../../assets/islanders-new-shores-card.jpg';
import islandersHero from '../../assets/islanders-new-shores-hero.jpg';
import { createGameDialog } from '../game-dialog/game-dialog';
import type { GameDialogData } from '../game-dialog/game-dialog';
import { createButton, createIconButton } from '@/shared/components';

type SliderGame = GameDialogData & { slug: string; cardImage: string };
type CardSlot = 'peek' | 'side' | 'featured';

const AUTOPLAY_INTERVAL = 4000;
const VISIBLE_OFFSETS = [-2, -1, 0, 1, 2] as const;
const CARD_SLOTS: CardSlot[] = ['peek', 'side', 'featured', 'side', 'peek'];

const GAMES: SliderGame[] = [
    {
        slug: 'vacation-cafe-simulator',
        cardImage: vacationCafeCard,
        image: vacationCafeHero,
        title: 'Vacation Cafe Simulator',
        category: 'Strategy',
        price: 'Free',
        rating: 4.8,
        likes: 28_750,
        description:
            'Cozy Italian Vacation Cafe 🏖️ No timers, No stress 😌 cook traditional dishes 🍝 upgrade and customize 🏠 just drink Prosecco 🥂 relax and grow your dream cafe ✨',
        tags: [],
        players: 'Solo',
        duration: '40-90 min',
        mode: 'Desktop',
    },
    {
        slug: 'winter-burrow',
        cardImage: winterBurrowCard,
        image: winterBurrowHero,
        title: 'Winter Burrow',
        category: 'Farm',
        price: 'Free',
        rating: 4.9,
        likes: 32_400,
        description:
            'A cozy woodland survival game about a mouse restoring their childhood burrow. Explore, gather resources, craft, knit warm sweaters, bake pies and meet the locals.',
        tags: [],
        players: 'Solo',
        duration: '40-90 min',
        mode: 'Desktop',
    },
    {
        slug: 'shelve-the-potions',
        cardImage: shelvePotionsCard,
        image: shelvePotionsHero,
        title: 'Shelve the Potions!',
        category: 'Puzzle',
        price: 'Free',
        rating: 4.7,
        likes: 21_300,
        description:
            "Organize 2000+ potions on shelves after the witch's cats have knocked them over, using clues around an enchanted cellar. Learn strange symbols and decipher cryptic notes.",
        tags: [],
        players: 'Solo',
        duration: '40-90 min',
        mode: 'Desktop',
    },
    {
        slug: 'heartopia',
        cardImage: heartopiaCard,
        image: heartopiaHero,
        title: 'Heartopia',
        category: 'Strategy',
        price: '$1.99',
        rating: 4.6,
        likes: 46_800,
        description:
            'A multiplayer life simulation game crafted for creativity, freedom, and peace. Build your dream home, explore hobbies, and forge warm connections with friends in a cozy town.',
        tags: [],
        players: 'Solo',
        duration: '40-90 min',
        mode: 'Desktop',
    },
    {
        slug: 'palia',
        cardImage: paliaCard,
        image: paliaHero,
        title: 'Palia',
        category: 'Strategy',
        price: 'Free',
        rating: 4.8,
        likes: 89_500,
        description:
            'A free-to-play fantasy life sim adventure where you can craft, explore, and create the life and home of your dreams in a vibrant, heartwarming world.',
        tags: [],
        players: 'Solo',
        duration: '40-90 min',
        mode: 'Desktop',
    },
    {
        slug: 'cat-mail-co',
        cardImage: catMailCard,
        image: catMailHero,
        title: 'Cat Mail Co.',
        category: 'Puzzle',
        price: 'Free',
        rating: 4.9,
        likes: 38_200,
        description:
            'Run a cozy cat post office. Sort and deliver parcels from the daily boat. At night, the moon reveals hidden truths about packages. Clear a strange backlog and unlock new destinations.',
        tags: [],
        players: 'Solo',
        duration: '40-90 min',
        mode: 'Desktop',
    },
    {
        slug: 'tiny-glade',
        cardImage: tinyGladeCard,
        image: tinyGladeHero,
        title: 'Tiny Glade',
        category: 'Arcade',
        price: '$3.99',
        rating: 4.9,
        likes: 67_300,
        description:
            'A small diorama builder where you doodle whimsical castles, cozy cottages & romantic ruins. No management, combat or goals — just lovable dioramas.',
        tags: [],
        players: 'Solo',
        duration: '40-90 min',
        mode: 'Desktop',
    },
    {
        slug: 'tailside-cozy-cafe-sim',
        cardImage: tailsideCard,
        image: tailsideHero,
        title: 'Tailside: Cozy Cafe Sim',
        category: 'Strategy',
        price: 'Free',
        rating: 4.8,
        likes: 35_600,
        description:
            'Run your own cozy café in Tailside! Brew coffee, decorate your café, follow small stories in the daily newspaper. Unlock new items, skills, villagers, and creature visitors.',
        tags: [],
        players: 'Solo',
        duration: '40-90 min',
        mode: 'Desktop',
    },
    {
        slug: 'islanders-new-shores',
        cardImage: islandersCard,
        image: islandersHero,
        title: 'ISLANDERS: New Shores',
        category: 'Strategy',
        price: 'Free',
        rating: 4.9,
        likes: 54_200,
        description:
            'Build your island retreat in a calm, minimalist world with exciting new features that keep the classic charm while inspiring fresh creativity.',
        tags: [],
        players: 'Solo',
        duration: '40-90 min',
        mode: 'Desktop',
    },
];

function formatCount(value: number): string {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    return value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K` : String(value);
}

function createMetadata(game: SliderGame): HTMLElement {
    const metadata = document.createElement('div');

    const rating = document.createElement('span');
    rating.dataset.stat = 'rating';
    rating.setAttribute('aria-label', `${game.rating.toFixed(1)} out of 5 stars`);
    rating.textContent = `★ ${game.rating.toFixed(1)}`;

    const likes = document.createElement('span');
    likes.dataset.stat = 'likes';
    likes.setAttribute('aria-label', `${formatCount(game.likes)} likes`);
    likes.textContent = `♥ ${formatCount(game.likes)}`;

    metadata.append(rating, likes);
    return metadata;
}

function updateCard(card: HTMLElement, game: SliderGame, slot: CardSlot): void {
    card.dataset.slot = slot;
    card.dataset.gameSlug = game.slug;
    card.setAttribute('aria-label', `Open details for ${game.title}`);

    const image = card.querySelector('img');
    const title = card.querySelector('h3');
    const metadata = card.querySelector(':scope > div > div');
    if (image instanceof HTMLImageElement) {
        image.src = game.cardImage;
        image.alt = game.title;
    }
    if (title instanceof HTMLHeadingElement) {
        title.textContent = game.title;
        title.title = game.title;
    }
    if (metadata instanceof HTMLElement) {
        metadata.replaceChildren(...createMetadata(game).childNodes);
    }
}

export function createCarousel(): HTMLElement {
    const section = document.createElement('section');
    section.className = 'carousel';
    section.setAttribute('aria-labelledby', 'carousel-title');
    section.dataset.currentIndex = '0';

    const headingElement = document.createElement('header');
    const title = document.createElement('h2');
    title.id = 'carousel-title';
    title.textContent = 'New Games';

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
    const controls = document.createElement('div');
    controls.append(previousButton, nextButton);
    headingElement.append(title, controls);

    const viewport = document.createElement('div');
    viewport.dataset.carouselViewport = '';
    viewport.setAttribute('aria-label', 'Featured games slider');
    const track = document.createElement('div');
    track.dataset.track = '';
    viewport.append(track);

    const dialog = createGameDialog(GAMES[0]);
    const cards = new Map<string, HTMLElement>();
    for (const game of GAMES) {
        const card = document.createElement('article');
        card.tabIndex = 0;
        card.setAttribute('role', 'button');

        const image = document.createElement('img');
        image.alt = game.title;
        const info = document.createElement('div');
        const gameTitle = document.createElement('h3');
        const metadata = createMetadata(game);
        info.append(gameTitle, metadata);
        card.append(image, info);
        updateCard(card, game, 'peek');

        const openGame = (): void => {
            if (Date.now() < suppressCardClickUntil) return;
            pauseAutoplay();
            dialog.setGame(game);
            dialog.open();
        };
        card.addEventListener('click', openGame);
        card.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key !== 'Enter' && event.key !== ' ') return;
            event.preventDefault();
            openGame();
        });

        cards.set(game.slug, card);
        track.append(card);
    }

    const indicators = document.createElement('nav');
    indicators.setAttribute('aria-label', 'Choose featured game');
    for (const [gameIndex, game] of GAMES.entries()) {
        const indicator = createButton({ variant: 'primary', size: 'sm' });
        indicator.classList.add('carousel-indicator');
        indicator.setAttribute('aria-label', `Show ${game.title} in center`);
        indicator.dataset.gameIndex = String(gameIndex);
        indicators.append(indicator);
    }

    let currentIndex = 0;
    let autoplayTimer: number | undefined;
    let remainingDuration = AUTOPLAY_INTERVAL;
    let autoplayDeadline = 0;
    let isAutoplayPaused = false;
    let pointerStartX: number | undefined;
    let pointerStartY = 0;
    let isPointerDown = false;
    let activePointerId: number | undefined;
    let suppressCardClickUntil = 0;

    function scheduleAutoplay(): void {
        if (isAutoplayPaused) return;
        if (autoplayTimer !== undefined) globalThis.clearTimeout(autoplayTimer);
        autoplayDeadline = performance.now() + remainingDuration;
        autoplayTimer = globalThis.setTimeout(() => {
            autoplayTimer = undefined;
            advance(1);
        }, remainingDuration);
    }

    function pauseAutoplay(): void {
        if (isAutoplayPaused) return;
        isAutoplayPaused = true;
        if (autoplayTimer === undefined) return;
        globalThis.clearTimeout(autoplayTimer);
        autoplayTimer = undefined;
        remainingDuration = Math.max(0, autoplayDeadline - performance.now());
    }

    function resumeAutoplay(shouldResetTimer = false): void {
        if (shouldResetTimer) remainingDuration = AUTOPLAY_INTERVAL;
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

        const activeGames = VISIBLE_OFFSETS.map((offset, position) => {
            const gameIndex = (currentIndex + offset + GAMES.length) % GAMES.length;
            return { game: GAMES[gameIndex], slot: CARD_SLOTS[position] };
        });
        const activeSlugs = new Set(activeGames.map(({ game }) => game.slug));
        const activeCards: HTMLElement[] = [];
        for (const { game, slot } of activeGames) {
            const card = cards.get(game.slug);
            if (!card) continue;
            updateCard(card, game, slot);
            card.hidden = false;
            card.removeAttribute('aria-hidden');
            activeCards.push(card);
        }

        const hiddenCards = GAMES.filter((game) => !activeSlugs.has(game.slug))
            .map((game) => cards.get(game.slug))
            .filter((card): card is HTMLElement => card !== undefined);
        for (const card of hiddenCards) {
            card.hidden = true;
            card.setAttribute('aria-hidden', 'true');
        }
        track.replaceChildren(...activeCards, ...hiddenCards);
        section.dataset.currentIndex = String(currentIndex);
        section.dataset.currentGame = GAMES[currentIndex].slug;

        for (const card of activeCards) {
            if (!shouldAnimate || globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches)
                continue;
            const previousRect = previousRects.get(card);
            if (!previousRect) {
                card.animate([{ opacity: 0 }, { opacity: 1 }], {
                    duration: 220,
                    easing: 'ease-out',
                });
                continue;
            }
            const nextRect = card.getBoundingClientRect();
            const offsetX = previousRect.left - nextRect.left;
            if (Math.abs(offsetX) < 1) continue;
            card.animate(
                [{ transform: `translateX(${offsetX}px)` }, { transform: 'translateX(0)' }],
                { duration: 350, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
            );
        }

        for (const [gameIndex, indicator] of [...indicators.children].entries()) {
            indicator.setAttribute('aria-current', gameIndex === currentIndex ? 'true' : 'false');
        }
    }

    function advance(direction: 1 | -1): void {
        currentIndex = (currentIndex + direction + GAMES.length) % GAMES.length;
        remainingDuration = AUTOPLAY_INTERVAL;
        renderCards(true);
        scheduleAutoplay();
    }

    function showGame(gameIndex: number): void {
        currentIndex = gameIndex;
        remainingDuration = AUTOPLAY_INTERVAL;
        renderCards(true);
        scheduleAutoplay();
    }

    const finishPointer = (event: PointerEvent): void => {
        if (!isPointerDown || pointerStartX === undefined || event.pointerId !== activePointerId)
            return;
        const deltaX = event.clientX - pointerStartX;
        const deltaY = event.clientY - pointerStartY;
        const wasSwipe = Math.abs(deltaX) >= 40 && Math.abs(deltaX) > Math.abs(deltaY);
        isPointerDown = false;
        activePointerId = undefined;
        pointerStartX = undefined;
        delete viewport.dataset.pressed;

        if (wasSwipe) {
            suppressCardClickUntil = Date.now() + 500;
            advance(deltaX < 0 ? 1 : -1);
            resumeAutoplay();
            return;
        }
        resumeAutoplay();
    };

    viewport.addEventListener('pointerdown', (event: PointerEvent) => {
        if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
        pointerStartX = event.clientX;
        pointerStartY = event.clientY;
        isPointerDown = true;
        activePointerId = event.pointerId;
        viewport.dataset.pressed = 'true';
        pauseAutoplay();
    });
    globalThis.addEventListener('pointerup', finishPointer);
    globalThis.addEventListener('pointercancel', finishPointer);

    previousButton.addEventListener('click', () => advance(-1));
    nextButton.addEventListener('click', () => advance(1));
    for (const [gameIndex, indicator] of [...indicators.children].entries()) {
        indicator.addEventListener('click', () => showGame(gameIndex));
    }
    dialog.dialog.addEventListener('close', () => resumeAutoplay());

    renderCards();
    section.append(headingElement, viewport, indicators, dialog.dialog);
    scheduleAutoplay();
    return section;
}

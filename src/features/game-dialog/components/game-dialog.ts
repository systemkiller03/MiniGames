import heroImage from '@/assets/grimshire-hero.jpg';
import { createButton, createToggleButton } from '@/shared/components';
import { createElement, Heart, Star, Trophy } from 'lucide';
import type { GameDialogLayout } from './layout';
import { formatCount } from '@/shared/utils/format-count';

type IconNode = Parameters<typeof createElement>[0];

export type GameDialogData = {
    slug?: string;
    image: string;
    title: string;
    category: string;
    price: string;
    rating: number;
    likes: number;
    description: string;
    tags?: string[];
    players: string;
    duration: string;
    mode?: string;
    records?: GameRecord[];
};

export type GameRecord = {
    medal: string;
    name: string;
    score: string;
    time: string;
};

export const DEFAULT_GAME: GameDialogData = {
    slug: 'tukoni-forest-keepers',
    image: heroImage,
    title: 'Tukoni: Forest Keepers',
    category: 'Puzzle',
    price: 'Free',
    rating: 4.9,
    likes: 31_200,
    description:
        'Tukoni: Forest Keepers — a cozy hand-drawn puzzle-adventure. You are Traveller, a little forest spirit on an important mission. Wander storybook meadows, visit mushroom villages, meet adorable inhabitants, solve gentle hand-crafted puzzles, brew herbal teas and help the Tukoni forest prepare peacefully for the coming winter.',
    tags: [],
    players: 'Solo',
    duration: '40-90 min',
    mode: 'Desktop',
    records: [
        { medal: '🥇', name: 'ForestSpirit', score: '356,700 pts', time: '2 days ago' },
        { medal: '🥈', name: 'TeaBrewer', score: '332,400 pts', time: '5 days ago' },
        { medal: '🥉', name: 'HerbalistPath', score: '308,900 pts', time: '1 week ago' },
    ],
};

function createScore(label: string, value: string, icon: IconNode): HTMLDivElement {
    const item = document.createElement('div');
    item.dataset.score = label.toLowerCase();
    item.setAttribute('aria-label', `${label} ${value}`);

    const iconWrap = document.createElement('span');
    iconWrap.append(createElement(icon));

    const text = document.createElement('span');
    text.textContent = value;

    item.append(iconWrap, text);
    return item;
}

function createStat(label: string, value: string): HTMLDivElement {
    const stat = document.createElement('div');

    const name = document.createElement('dt');
    name.textContent = label;

    const detail = document.createElement('dd');
    detail.textContent = value;

    stat.append(name, detail);
    return stat;
}

function createRecord(record: GameRecord): HTMLDivElement {
    const row = document.createElement('div');
    row.setAttribute('role', 'listitem');

    const player = document.createElement('div');
    const medal = document.createElement('span');
    medal.setAttribute('aria-hidden', 'true');
    medal.textContent = record.medal;
    const name = document.createElement('strong');
    name.textContent = record.name;
    player.append(medal, name);

    const result = document.createElement('div');
    const score = document.createElement('strong');
    score.textContent = record.score;
    const time = document.createElement('span');
    time.textContent = record.time;
    result.append(score, time);

    row.append(player, result);
    return row;
}

export function createGameDialogComponent(
    layout: GameDialogLayout,
    commentsSection: HTMLElement,
    initialGame: GameDialogData = DEFAULT_GAME,
    canPerformProtectedAction?: () => boolean,
    onFavoriteToggle?: (isFavorited: boolean) => void,
): {
    setGame: (game: GameDialogData) => void;
    resetUserState: () => void;
    setFavoriteButtonState: (state: {
        pressed: boolean;
        count: number;
        disabled?: boolean;
        loading?: boolean;
    }) => void;
} {
    const title = document.createElement('h2');
    title.id = 'game-dialog-title';
    const meta = document.createElement('div');
    const titleRow = document.createElement('header');
    titleRow.append(title, meta);

    const description = document.createElement('p');
    description.id = 'game-dialog-description';
    const stats = document.createElement('dl');

    const actions = document.createElement('div');
    const playButton = createButton({
        label: 'Play Now',
        variant: 'primary',
        size: 'lg',
        shadow: true,
    });
    let saveButton = createToggleButton({ count: initialGame.likes });
    saveButton.classList.add('game-dialog-favorite');
    actions.append(playButton, saveButton);
    actions.addEventListener(
        'click',
        (event: MouseEvent) => {
            const target =
                event.target instanceof Element
                    ? event.target.closest('.game-dialog-favorite')
                    : undefined;
            if (!(target instanceof HTMLButtonElement)) {
                return;
            }

            if (canPerformProtectedAction?.() === false) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            if (target.disabled || target.dataset.loading === 'true') {
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            onFavoriteToggle?.(saveButton.dataset.pressed !== 'true');
        },
        { capture: true },
    );

    const recordsSection = document.createElement('section');
    const recordsTitle = document.createElement('h3');
    recordsTitle.append(createElement(Trophy), document.createTextNode('Top Records'));
    const records = document.createElement('div');
    records.setAttribute('role', 'list');
    recordsSection.append(recordsTitle, records);

    const restoreContent = (): void => {
        layout.setContent(titleRow, description, stats, actions, recordsSection, commentsSection);
    };

    const setFavoriteButtonState = ({
        pressed,
        count,
        disabled = false,
        loading = false,
    }: {
        pressed: boolean;
        count: number;
        disabled?: boolean;
        loading?: boolean;
    }): void => {
        saveButton.disabled = disabled || loading;
        saveButton.dataset.loading = String(loading);
        saveButton.dataset.pressed = String(pressed);
        saveButton.setAttribute('aria-pressed', String(pressed));
        if (loading) {
            saveButton.setAttribute('aria-label', 'Saving favorite');
        } else {
            const labelText = pressed ? 'Remove from Favorites' : 'Add to Favorites';
            saveButton.setAttribute('aria-label', `${labelText}, ${count} likes`);
        }

        const slotLabel = saveButton.querySelector('span');
        if (slotLabel) {
            if (loading) {
                slotLabel.textContent = 'Saving…';
            } else if (pressed) {
                slotLabel.textContent = 'Remove from Favorites';
            } else {
                slotLabel.textContent = 'Add to Favorites';
            }
        }

        const countToken = saveButton.querySelectorAll('span')[1];
        if (countToken) {
            countToken.textContent = String(count);
        }
    };

    const setGame = (game: GameDialogData): void => {
        const safeRecords = game.records ?? DEFAULT_GAME.records ?? [];

        layout.image.src = game.image;
        layout.image.alt = game.title;
        title.textContent = game.title;
        meta.replaceChildren(
            createScore('Rating', game.rating.toFixed(1), Star),
            createScore('Likes', formatCount(game.likes), Heart),
        );
        description.textContent = game.description;
        stats.replaceChildren(
            createStat('Genre', game.category),
            createStat('Players', game.players),
            createStat('Duration', game.duration),
            createStat('Price', game.price),
        );
        records.replaceChildren(...safeRecords.map((record) => createRecord(record)));
        restoreContent();
    };

    const resetUserState = (): void => {
        saveButton = createToggleButton({ count: initialGame.likes });
        saveButton.classList.add('game-dialog-favorite');
        actions.replaceChildren(playButton, saveButton);
        setFavoriteButtonState({ pressed: false, count: initialGame.likes });
    };

    setGame(initialGame);
    return { setGame, resetUserState, setFavoriteButtonState };
}

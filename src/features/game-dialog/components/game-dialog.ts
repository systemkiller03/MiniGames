import heroImage from '@/assets/grimshire-hero.jpg';
import { createButton, createIconButton, createToggleButton } from '@/shared/components';
import { createElement, Heart, Send, Star, Trophy } from 'lucide';
import type { GameDialogLayout } from './layout';

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
    comments?: GameComment[];
};

export type GameRecord = {
    medal: string;
    name: string;
    score: string;
    time: string;
};

export type GameComment = {
    name: string;
    avatar: string;
    tone: 'blue' | 'yellow' | 'mist';
    time: string;
    text: string;
    likes: number;
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
    comments: [
        {
            name: 'ForestDweller',
            avatar: 'F',
            tone: 'blue',
            time: '3 hours ago',
            text: "The hand-drawn art is absolutely magical 🍄 Every location feels like a page from a children's storybook. The mushroom village made me cry happy tears!",
            likes: 12,
        },
        {
            name: 'HerbalTeaLover',
            avatar: 'H',
            tone: 'yellow',
            time: '1 day ago',
            text: 'Perfect cozy evening game — brew a cup of chamomile, wrap in a blanket and help the little Tukoni prepare for winter. The puzzles are gentle but satisfying.',
            likes: 5,
        },
        {
            name: 'CottageCoreMia',
            avatar: 'C',
            tone: 'mist',
            time: '3 days ago',
            text: 'I want to live inside this game forever 🌿 The NPCs are so charming, the tea recipes are real, and the atmosphere is pure warmth and calm.',
            likes: 8,
        },
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

function createComment(comment: GameComment): HTMLElement {
    const card = document.createElement('article');

    const heading = document.createElement('header');
    const author = document.createElement('div');
    const avatar = document.createElement('span');
    avatar.dataset.tone = comment.tone;
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = comment.avatar;
    const name = document.createElement('strong');
    name.textContent = comment.name;
    author.append(avatar, name);
    const time = document.createElement('time');
    time.textContent = comment.time;
    heading.append(author, time);

    const text = document.createElement('p');
    text.textContent = comment.text;

    const likes = createToggleButton({
        iconOnly: true,
        compact: true,
        labelOff: 'Like comment',
        labelOn: 'Unlike comment',
        count: comment.likes,
    });
    likes.dataset.role = 'likes';

    card.append(heading, text, likes);
    return card;
}

export function createGameDialogComponent(
    layout: GameDialogLayout,
    initialGame: GameDialogData = DEFAULT_GAME,
): { setGame: (game: GameDialogData) => void } {
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
    const saveButton = createToggleButton();
    saveButton.classList.add('game-dialog-favorite');
    actions.append(playButton, saveButton);

    const recordsSection = document.createElement('section');
    const recordsTitle = document.createElement('h3');
    recordsTitle.append(createElement(Trophy), document.createTextNode('Top Records'));
    const records = document.createElement('div');
    records.setAttribute('role', 'list');
    recordsSection.append(recordsTitle, records);

    const commentsSection = document.createElement('section');
    const commentsTitle = document.createElement('h3');
    const composer = document.createElement('form');
    const userAvatar = document.createElement('span');
    userAvatar.setAttribute('aria-hidden', 'true');
    userAvatar.textContent = 'U';
    const commentInput = document.createElement('textarea');
    commentInput.name = 'comment';
    commentInput.placeholder = 'Write a comment...';
    commentInput.setAttribute('aria-label', 'Write a comment');
    commentInput.maxLength = 300;
    const sendButton = createIconButton('Post comment', Send, {
        size: 'md',
        shape: 'square',
        variant: 'primary',
    });
    sendButton.type = 'submit';
    composer.append(userAvatar, commentInput, sendButton);

    const comments = document.createElement('div');
    let commentData: GameComment[] = initialGame.comments ?? DEFAULT_GAME.comments ?? [];
    const renderComments = (): void => {
        commentsTitle.textContent = `Comments (${commentData.length})`;
        comments.replaceChildren(...commentData.map((comment) => createComment(comment)));
    };
    composer.addEventListener('submit', (event) => {
        event.preventDefault();
        const text = commentInput.value.trim();
        if (!text) return;
        commentData = [
            {
                name: 'You',
                avatar: 'U',
                tone: 'yellow',
                time: 'just now',
                text,
                likes: 0,
            },
            ...commentData,
        ];
        renderComments();
        composer.reset();
    });
    renderComments();
    commentsSection.append(commentsTitle, composer, comments);

    const restoreContent = (): void => {
        layout.setContent(titleRow, description, stats, actions, recordsSection, commentsSection);
    };

    const setGame = (game: GameDialogData): void => {
        const safeRecords =
            game.records && game.records.length > 0 ? game.records : (DEFAULT_GAME.records ?? []);
        const safeComments =
            game.comments && game.comments.length > 0
                ? game.comments
                : (DEFAULT_GAME.comments ?? []);

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
        commentData = [...safeComments];
        renderComments();
        restoreContent();
    };

    setGame(initialGame);
    return { setGame };
}

function formatCount(value: number): string {
    if (value >= 1_000_000) {
        return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }

    return value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K` : value.toString();
}

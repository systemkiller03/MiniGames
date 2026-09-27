import'./game-dialog.scss';
import heroImage from'@/assets/grimshire-hero.jpg';
import{ createButton } from'@/shared/components/button/button';
import{ createElement, Heart, Send, Star, Trophy, X } from'lucide';

type IconNode = Parameters<typeof createElement>[0];

export type GameDialogData = {
    image: string;
    title: string;
    category: string;
    price: string;
    rating: number;
    likes: number;
    description: string;
    tags: string[];
    players: string;
    duration: string;
    mode: string;
};

const DEFAULT_GAME: GameDialogData = {
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
};

const TOP_RECORDS = [
    { medal: '🥇', name: 'ForestSpirit', score: '356,700 pts', time: '2 days ago' },
    { medal: '🥈', name: 'TeaBrewer', score: '332,400 pts', time: '5 days ago' },
    { medal: '🥉', name: 'HerbalistPath', score: '308,900 pts', time: '1 week ago' },
];

type GameComment = {
    name: string;
    avatar: string;
    tone: 'blue' | 'yellow' | 'mist';
    time: string;
    text: string;
    likes: number;
};

const INITIAL_COMMENTS: GameComment[] = [
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
];

function createIconButton(label: string, icon: IconNode, className: string): HTMLButtonElement{
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-label', label);
    button.append(createElement(icon));
    return button;
}

function createScore(label: string, value: string, icon: IconNode): HTMLDivElement{
    const item = document.createElement('div');
    item.className = 'game-dialog__score';
    item.setAttribute('aria-label', `${label} ${value}`);

    const iconWrap = document.createElement('span');
    iconWrap.className = 'game-dialog__score-icon';
    iconWrap.append(createElement(icon));

    const text = document.createElement('span');
    text.className = 'game-dialog__score-text';
    text.textContent = value;

    item.append(iconWrap, text);
    return item;
}

function createStat(label: string, value: string): HTMLDivElement{
    const stat = document.createElement('div');
    stat.className = 'game-dialog__stat';

    const name = document.createElement('span');
    name.className = 'game-dialog__stat-label';
    name.textContent = label;

    const detail = document.createElement('strong');
    detail.className = 'game-dialog__stat-value';
    detail.textContent = value;

    stat.append(name, detail);
    return stat;
}

function createRecord(record: (typeof TOP_RECORDS)[number]): HTMLDivElement{
    const row = document.createElement('div');
    row.className = 'game-dialog__record';

    const player = document.createElement('div');
    player.className = 'game-dialog__record-player';
    const medal = document.createElement('span');
    medal.className = 'game-dialog__medal';
    medal.setAttribute('aria-hidden', 'true');
    medal.textContent = record.medal;
    const name = document.createElement('strong');
    name.textContent = record.name;
    player.append(medal, name);

    const result = document.createElement('div');
    result.className = 'game-dialog__record-result';
    const score = document.createElement('strong');
    score.textContent = record.score;
    const time = document.createElement('span');
    time.textContent = record.time;
    result.append(score, time);

    row.append(player, result);
    return row;
}

function createComment(comment: GameComment): HTMLElement{
    const card = document.createElement('article');
    card.className = 'game-dialog__comment';

    const heading = document.createElement('div');
    heading.className = 'game-dialog__comment-heading';
    const author = document.createElement('div');
    author.className = 'game-dialog__comment-author';
    const avatar = document.createElement('span');
    avatar.className = `game-dialog__avatar game-dialog__avatar--${comment.tone}`;
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = comment.avatar;
    const name = document.createElement('strong');
    name.textContent = comment.name;
    author.append(avatar, name);
    const time = document.createElement('time');
    time.textContent = comment.time;
    heading.append(author, time);

    const text = document.createElement('p');
    text.className = 'game-dialog__comment-text';
    text.textContent = comment.text;

    const likes = document.createElement('span');
    likes.className = 'game-dialog__comment-likes';
    likes.append(createElement(Heart));
    const likeCount = document.createElement('span');
    likeCount.textContent = String(comment.likes);
    likes.append(likeCount);

    card.append(heading, text, likes);
    return card;
}

export function createGameDialog(initialGame: GameDialogData = DEFAULT_GAME): {
    dialog: HTMLDialogElement;
    setGame: (game: GameDialogData) => void;
    open: () => void;
    close: () => void;
}{
    const dialog = document.createElement('dialog');
    dialog.className = 'game-dialog';
    dialog.setAttribute('aria-labelledby', 'game-dialog-title');
    dialog.setAttribute('aria-describedby', 'game-dialog-description');

    const panel = document.createElement('div');
    panel.className = 'game-dialog__panel';

    const close = createIconButton('Close dialog', X, 'game-dialog__close');
    close.addEventListener('click', () => dialog.close());

    const media = document.createElement('div');
    media.className = 'game-dialog__media';
    const image = document.createElement('img');
    image.className = 'game-dialog__image';
    image.alt = 'Game cover';
    media.append(image);

    const content = document.createElement('div');
    content.className = 'game-dialog__content';

    const title = document.createElement('h2');
    title.id = 'game-dialog-title';
    title.className = 'game-dialog__title';
    const meta = document.createElement('div');
    meta.className = 'game-dialog__meta';
    const titleRow = document.createElement('div');
    titleRow.className = 'game-dialog__title-row';
    titleRow.append(title, meta);

    const description = document.createElement('p');
    description.id = 'game-dialog-description';
    description.className = 'game-dialog__description';
    const stats = document.createElement('div');
    stats.className = 'game-dialog__stats';

    const actions = document.createElement('div');
    actions.className = 'game-dialog__actions';
    const playButton = createButton({ label: 'Play Now', variant: 'primary' });
    playButton.classList.add('game-dialog__primary-action');
    const saveButton = createButton({ icon: createElement(Heart), variant: 'outline' });
    saveButton.append(document.createTextNode('Add to Favorites'));
    saveButton.classList.add('game-dialog__secondary-action');
    actions.append(playButton, saveButton);

    const recordsSection = document.createElement('section');
    recordsSection.className = 'game-dialog__section';
    const recordsTitle = document.createElement('h3');
    recordsTitle.className = 'game-dialog__section-title';
    recordsTitle.append(createElement(Trophy), document.createTextNode('Top Records'));
    const records = document.createElement('div');
    records.className = 'game-dialog__records';
    records.replaceChildren(...TOP_RECORDS.map((record) => createRecord(record)));
    recordsSection.append(recordsTitle, records);

    const commentsSection = document.createElement('section');
    commentsSection.className = 'game-dialog__section game-dialog__comments-section';
    const commentsTitle = document.createElement('h3');
    commentsTitle.className = 'game-dialog__comments-title';
    const composer = document.createElement('form');
    composer.className = 'game-dialog__composer';
    const userAvatar = document.createElement('span');
    userAvatar.className = 'game-dialog__composer-avatar';
    userAvatar.setAttribute('aria-hidden', 'true');
    userAvatar.textContent = 'U';
    const commentInput = document.createElement('textarea');
    commentInput.className = 'game-dialog__comment-input';
    commentInput.name = 'comment';
    commentInput.placeholder = 'Write a comment...';
    commentInput.setAttribute('aria-label', 'Write a comment');
    commentInput.maxLength = 300;
    const sendButton = createIconButton('Post comment', Send, 'game-dialog__send');
    sendButton.type = 'submit';
    composer.append(userAvatar, commentInput, sendButton);

    const comments = document.createElement('div');
    comments.className = 'game-dialog__comments';
    const commentData = INITIAL_COMMENTS.map((comment) => ({ ...comment }));
    const renderComments = (): void => {
        commentsTitle.textContent = `Comments (${commentData.length})`;
        comments.replaceChildren(...commentData.map((comment) => createComment(comment)));
    };
    composer.addEventListener('submit', (event) => {
        event.preventDefault();
        const text = commentInput.value.trim();
        if(!text) return;
        commentData.unshift({
            name: 'You',
            avatar: 'U',
            tone: 'yellow',
            time: 'just now',
            text,
            likes: 0,
        });
        renderComments();
        composer.reset();
    });
    renderComments();
    commentsSection.append(commentsTitle, composer, comments);

    content.append(titleRow, description, stats, actions, recordsSection, commentsSection);
    panel.append(close, media, content);
    dialog.append(panel);

    const setGame = (game: GameDialogData): void => {
        image.src = game.image;
        image.alt = game.title;
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
    };

    dialog.addEventListener('click', (event) => {
        if(event.target === dialog){
            dialog.close();
        }
    });

    setGame(initialGame);

    return{
        dialog,
        setGame,
        open: () => {
            if(typeof dialog.showModal === 'function'){
                dialog.showModal();
                return;
            }
            dialog.setAttribute('open', 'open');
        },
        close: () => dialog.close(),
    };
}

function formatCount(value: number): string{
    if(value >= 1_000_000){
        return`${(value / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
    }
    return value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}K` : value.toString();
}

import '../styles/comments.scss';
import { createIconButton } from '@/shared/components';
import { createToggleButton } from '@/shared/components';
import { formatRelativeTime } from '@/shared/utils/format-relative-time';
import { Send } from 'lucide';
import { getGameCommentsWithMeta, type ApiGameComment } from '../api/comments.api';
import { createCommentsErrorState } from './error';
import { createCommentsLoadingState } from './loading';

type GameComment = {
    name: string;
    avatar: string;
    tone: 'blue' | 'yellow' | 'mist';
    time: string;
    text: string;
    likes: number;
};

export type CommentsLayout = {
    element: HTMLElement;
    title: HTMLHeadingElement;
    composer: HTMLFormElement;
    input: HTMLTextAreaElement;
    content: HTMLDivElement;
};

export type CommentsFeature = {
    element: HTMLElement;
    load: (slug: string) => Promise<void>;
};

function toTone(name: string): GameComment['tone'] {
    const toneMap: Record<string, GameComment['tone']> = {
        b: 'blue',
        c: 'mist',
        f: 'blue',
        h: 'yellow',
        y: 'yellow',
    };

    return toneMap[name.charAt(0).toLowerCase()] ?? 'mist';
}

function mapApiComment(comment: ApiGameComment): GameComment {
    return {
        name: comment.authorName,
        avatar: comment.authorName.charAt(0).toUpperCase(),
        tone: toTone(comment.authorName),
        time: formatRelativeTime(comment.createdAt),
        text: comment.text,
        likes: comment.likesCount,
    };
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

export function createCommentsLayout(): CommentsLayout {
    const element = document.createElement('section');
    element.className = 'game-comments';

    const title = document.createElement('h3');
    title.textContent = 'Comments';

    const composer = document.createElement('form');
    const userAvatar = document.createElement('span');
    userAvatar.setAttribute('aria-hidden', 'true');
    userAvatar.textContent = 'U';

    const input = document.createElement('textarea');
    input.name = 'comment';
    input.placeholder = 'Write a comment...';
    input.setAttribute('aria-label', 'Write a comment');
    input.maxLength = 300;

    const sendButton = createIconButton('Post comment', Send, {
        size: 'md',
        shape: 'square',
        variant: 'primary',
    });
    sendButton.type = 'submit';
    composer.append(userAvatar, input, sendButton);
    composer.hidden = true;

    const content = document.createElement('div');
    content.className = 'game-comments-content';

    element.append(title, composer, content);
    return { element, title, composer, input, content };
}

export function createComments(): CommentsFeature {
    const layout = createCommentsLayout();
    let requestId = 0;
    let commentData: GameComment[] = [];
    let totalCount = 0;

    const renderComments = (): void => {
        layout.title.textContent = `Comments (${totalCount})`;
        layout.composer.hidden = false;
        layout.content.replaceChildren(...commentData.map((comment) => createComment(comment)));
    };

    layout.composer.addEventListener('submit', (event) => {
        event.preventDefault();
        const text = layout.input.value.trim();
        if (!text) {
            return;
        }

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
        totalCount += 1;
        renderComments();
        layout.composer.reset();
    });

    const load = async (slug: string): Promise<void> => {
        const currentRequestId = ++requestId;
        layout.title.textContent = 'Comments';
        layout.composer.hidden = true;
        layout.content.replaceChildren(createCommentsLoadingState());

        try {
            const response = await getGameCommentsWithMeta(slug, {
                limit: 3,
                sort: 'newest',
            });
            if (currentRequestId !== requestId) {
                return;
            }

            commentData = response.comments.map((comment) => mapApiComment(comment));
            totalCount = response.totalCount;
            renderComments();
        } catch {
            if (currentRequestId !== requestId) {
                return;
            }

            layout.title.textContent = 'Comments';
            layout.content.replaceChildren(
                createCommentsErrorState(() => {
                    void load(slug);
                }),
            );
        }
    };

    return { element: layout.element, load };
}

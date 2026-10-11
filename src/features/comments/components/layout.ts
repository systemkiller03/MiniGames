import '../styles/comments.scss';
import { getAppSession } from '@/features/auth/api/auth.api';
import { createIconButton, createSnackbar, createToggleButton } from '@/shared/components';
import { formatRelativeTime } from '@/shared/utils/format-relative-time';
import { Send } from 'lucide';
import { getGameCommentsWithMeta, postGameComment, type ApiGameComment } from '../api/comments.api';
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
    avatar: HTMLSpanElement;
    input: HTMLTextAreaElement;
    submitButton: HTMLButtonElement;
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
    const avatar = document.createElement('span');
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = 'U';

    const input = document.createElement('textarea');
    input.name = 'comment';
    input.placeholder = 'Write a comment...';
    input.setAttribute('aria-label', 'Write a comment');
    input.maxLength = 500;

    const submitButton = createIconButton('Post comment', Send, {
        size: 'md',
        shape: 'square',
        variant: 'primary',
    });
    submitButton.type = 'submit';
    composer.append(avatar, input, submitButton);
    composer.hidden = true;

    const content = document.createElement('div');
    content.className = 'game-comments-content';

    element.append(title, composer, content);
    return { element, title, composer, avatar, input, submitButton, content };
}

export function createComments(canPerformProtectedAction?: () => boolean): CommentsFeature {
    const layout = createCommentsLayout();
    const snackbar = createSnackbar();
    document.body.append(snackbar.element);
    let requestId = 0;
    let commentData: GameComment[] = [];
    let totalCount = 0;
    let isSubmitting = false;
    let currentSlug = '';

    const syncComposerState = (): void => {
        const session = getAppSession();
        const isGuest = !session;
        const initial = session?.displayName.trim().charAt(0).toUpperCase() ?? 'U';

        layout.avatar.textContent = initial;
        layout.input.disabled = isGuest || isSubmitting;
        layout.submitButton.disabled = isGuest || isSubmitting;
        layout.input.placeholder = session ? 'Write a comment...' : 'Please sign in to comment';
    };

    const resizeTextarea = (): void => {
        layout.input.style.height = 'auto';
        const maxHeight = 120;
        const nextHeight = Math.min(layout.input.scrollHeight, maxHeight);
        layout.input.style.height = `${nextHeight}px`;
        layout.input.style.overflowY = layout.input.scrollHeight > maxHeight ? 'auto' : 'hidden';
    };

    const renderComments = (): void => {
        layout.title.textContent = `Comments (${totalCount})`;
        layout.composer.hidden = false;
        layout.content.replaceChildren(...commentData.map((comment) => createComment(comment)));
        syncComposerState();
    };

    layout.input.addEventListener('input', resizeTextarea);
    layout.input.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key !== 'Enter' || event.shiftKey) {
            return;
        }

        event.preventDefault();
        layout.composer.requestSubmit();
    });

    layout.composer.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        const session = getAppSession();
        if (!session) {
            canPerformProtectedAction?.();
            return;
        }

        const trimmedText = layout.input.value.trim();
        if (!trimmedText) {
            snackbar.show('Comment text cannot be empty.', 'error');
            return;
        }

        if (trimmedText.length > 500) {
            snackbar.show('Comment text must be 1-500 characters long.', 'error');
            return;
        }

        isSubmitting = true;
        syncComposerState();
        const savedText = layout.input.value;

        try {
            await postGameComment(currentSlug, {
                userEmail: session.email,
                authorName: session.displayName.trim(),
                text: trimmedText,
            });

            layout.input.value = '';
            resizeTextarea();
            snackbar.show('Comment posted.', 'success');
            await load(currentSlug);
        } catch (error) {
            layout.input.value = savedText;
            resizeTextarea();
            const message =
                error instanceof Error &&
                /fetch|network|timeout|failed to fetch/i.test(error.message)
                    ? 'Comment submission status is unknown. Please check your connection and try again.'
                    : 'Unable to post comment. Please try again.';
            snackbar.show(message, 'error');
        } finally {
            isSubmitting = false;
            syncComposerState();
        }
    });

    layout.element.addEventListener(
        'click',
        (event: MouseEvent) => {
            const target =
                event.target instanceof Element
                    ? event.target.closest('[data-role="likes"]')
                    : undefined;
            if (!(target instanceof HTMLButtonElement) || canPerformProtectedAction?.() !== false) {
                return;
            }
            event.preventDefault();
            event.stopPropagation();
        },
        { capture: true },
    );

    const load = async (slug: string): Promise<void> => {
        currentSlug = slug;
        const currentRequestId = ++requestId;
        layout.title.textContent = 'Comments';
        layout.composer.hidden = true;
        layout.content.replaceChildren(createCommentsLoadingState());
        layout.input.value = '';
        syncComposerState();

        try {
            const session = getAppSession();
            const response = await getGameCommentsWithMeta(slug, {
                limit: 3,
                sort: 'newest',
                ...(session && { userEmail: session.email }),
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
            syncComposerState();
        }
    };

    return { element: layout.element, load };
}

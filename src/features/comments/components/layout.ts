import '../styles/comments.scss';
import { getAppSession } from '@/features/auth/api/auth.api';
import { createIconButton, createSnackbar } from '@/shared/components';
import { formatRelativeTime } from '@/shared/utils/format-relative-time';
import { createElement, Heart, Send } from 'lucide';
import {
    getGameCommentsWithMeta,
    postGameComment,
    toggleCommentLike,
    type ApiGameComment,
} from '../api/comments.api';
import { createCommentsErrorState } from './error';
import { createCommentsLoadingState } from './loading';

const avatarTokens = [
    'avatar-random-1',
    'avatar-random-2',
    'avatar-random-3',
    'avatar-random-4',
    'avatar-random-5',
    'avatar-random-6',
] as const;

type GameCommentTone = (typeof avatarTokens)[number];

type GameComment = {
    commentId: string;
    name: string;
    avatar: string;
    tone: GameCommentTone;
    time: string;
    text: string;
    likes: number;
    isLikedByCurrentUser: boolean;
    isLoading?: boolean;
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

const avatarToneByName = new Map<string, GameCommentTone>();

function toInitial(name: string): string {
    const trimmedName = name.trim();
    return trimmedName ? trimmedName.charAt(0).toUpperCase() : 'U';
}

function toTone(name: string): GameCommentTone {
    const trimmedName = name.trim();
    const existingTone = trimmedName ? avatarToneByName.get(trimmedName) : undefined;
    if (existingTone) {
        return existingTone;
    }

    const nextTone = avatarTokens[Math.floor(Math.random() * avatarTokens.length)];
    if (trimmedName) {
        avatarToneByName.set(trimmedName, nextTone);
    }

    return nextTone;
}

function mapApiComment(comment: ApiGameComment): GameComment {
    return {
        commentId: comment.commentId,
        name: comment.authorName,
        avatar: toInitial(comment.authorName),
        tone: toTone(comment.authorName),
        time: formatRelativeTime(comment.createdAt),
        text: comment.text,
        likes: comment.likesCount,
        isLikedByCurrentUser: comment.isLikedByCurrentUser,
    };
}

function createComment(
    comment: GameComment,
    onLikeToggle: (commentId: string) => void,
): HTMLElement {
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

    const likes = document.createElement('button');
    likes.type = 'button';
    likes.className = 'toggle-button';
    likes.dataset.role = 'likes';
    likes.dataset.commentId = comment.commentId;
    likes.dataset.iconOnly = 'true';
    likes.dataset.compact = 'true';
    likes.dataset.pressed = String(comment.isLikedByCurrentUser);
    likes.dataset.loading = String(Boolean(comment.isLoading));
    likes.disabled = Boolean(comment.isLoading);
    likes.setAttribute('aria-pressed', String(comment.isLikedByCurrentUser));
    likes.setAttribute('aria-busy', String(Boolean(comment.isLoading)));
    likes.setAttribute(
        'aria-label',
        `${comment.isLikedByCurrentUser ? 'Unlike' : 'Like'} comment, ${comment.likes} likes`,
    );

    const icon = createElement(Heart);
    icon.setAttribute('aria-hidden', 'true');
    const count = document.createElement('span');
    count.textContent = String(comment.likes);
    likes.append(icon, count);
    likes.addEventListener('click', () => {
        if (comment.isLoading || likes.disabled) {
            return;
        }
        onLikeToggle(comment.commentId);
    });

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
    const session = getAppSession();
    avatar.dataset.tone = session ? toTone(session.displayName) : 'avatar-random-1';
    avatar.textContent = toInitial(session?.displayName ?? '');

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

export function createComments(
    canPerformProtectedAction?: (reason?: 'favorite' | 'comment-like') => boolean,
): CommentsFeature {
    const layout = createCommentsLayout();
    const snackbar = createSnackbar();
    document.body.append(snackbar.element);
    let requestId = 0;
    let commentData: GameComment[] = [];
    let totalCount = 0;
    let isSubmitting = false;
    let currentSlug = '';
    let pendingLikeCommentId: string | undefined;

    const syncComposerState = (): void => {
        const session = getAppSession();
        const isGuest = !session;
        const displayName = session?.displayName ?? '';
        const initial = toInitial(displayName);

        layout.avatar.textContent = initial;
        layout.avatar.dataset.tone = isGuest ? 'avatar-random-1' : toTone(displayName);
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
        layout.content.replaceChildren(
            ...commentData.map((comment) =>
                createComment(comment, (commentId) => {
                    void handleLikeToggle(commentId);
                }),
            ),
        );
        syncComposerState();
    };

    const handleLikeToggle = async (commentId: string): Promise<void> => {
        if (pendingLikeCommentId !== undefined) {
            return;
        }

        const session = getAppSession();
        if (!session) {
            canPerformProtectedAction?.('comment-like');
            return;
        }

        if (commentData.every((comment) => comment.commentId !== commentId)) {
            return;
        }

        pendingLikeCommentId = commentId;
        commentData = commentData.map((comment) =>
            comment.commentId === commentId ? { ...comment, isLoading: true } : comment,
        );
        renderComments();

        try {
            const result = await toggleCommentLike(commentId, session.email);
            commentData = commentData.map((comment) =>
                comment.commentId === commentId
                    ? {
                          ...comment,
                          isLoading: false,
                          isLikedByCurrentUser: result.isLikedByCurrentUser,
                          likes: result.likesCount,
                      }
                    : comment,
            );
            renderComments();
        } catch {
            commentData = commentData.map((comment) =>
                comment.commentId === commentId ? { ...comment, isLoading: false } : comment,
            );
            renderComments();
            snackbar.show('Unable to update comment likes right now. Please try again.', 'error');
        } finally {
            pendingLikeCommentId = undefined;
        }
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
            canPerformProtectedAction?.('comment-like');
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
            if (
                !(target instanceof HTMLButtonElement) ||
                canPerformProtectedAction?.('comment-like') !== false
            ) {
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

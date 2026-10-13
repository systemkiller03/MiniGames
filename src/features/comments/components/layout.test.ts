import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const comment = {
    commentId: 'comment-1',
    authorName: 'Élodie Park',
    text: 'A lovely game.',
    likesCount: 2,
    isLikedByCurrentUser: false,
    createdAt: '2026-01-01T00:00:00.000Z',
};

beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'comments-test');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(Response.json({ comments: [comment], count: 1 })),
    );
    localStorage.clear();
    document.body.replaceChildren();
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    localStorage.clear();
    document.body.replaceChildren();
});

describe('createComments', () => {
    it('blocks guests from submitting and disables the comment composer', async () => {
        const { createComments } = await import('./layout');
        const feature = createComments();
        await feature.load('cozy-sudoku');

        const input = feature.element.querySelector('textarea');
        const submit = feature.element.querySelector<HTMLButtonElement>('button[type="submit"]');
        expect(feature.element.textContent).toContain('Comments (1)');
        expect(input?.disabled).toBe(true);
        expect(input?.placeholder).toBe('Please sign in to comment');
        expect(submit?.disabled).toBe(true);

        feature.element
            .querySelector('form')
            ?.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        expect(fetch).toHaveBeenCalledTimes(1);
    });

    it('validates whitespace, posts a trimmed payload, refreshes comments, and clears the form', async () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.4);
        const { getAppSession, saveAppSession } = await import('@/features/auth/api/auth.api');
        saveAppSession({
            displayName: 'Ada Lovelace',
            email: 'ada@example.com',
            authenticatedAt: Date.now(),
        });
        expect(getAppSession()?.email).toBe('ada@example.com');
        vi.mocked(fetch).mockImplementation(async (input, init) => {
            if (init?.method === 'POST') {
                return Response.json({
                    data: { ...comment, commentId: 'comment-2', authorName: 'Ada Lovelace' },
                });
            }
            const url = String(input);
            const hasPostedComment = vi
                .mocked(fetch)
                .mock.calls.some(([, request]) => request?.method === 'POST');
            return hasPostedComment && url.includes('/games/cozy-sudoku/comments')
                ? Response.json({
                      comments: [comment, { ...comment, commentId: 'comment-2', text: 'New post' }],
                      totalCount: 2,
                  })
                : Response.json({ comments: [comment], totalCount: 1 });
        });
        const { createComments } = await import('./layout');
        const feature = createComments();
        await feature.load('cozy-sudoku');

        const input = feature.element.querySelector<HTMLTextAreaElement>('textarea');
        if (!input) {
            throw new Error('Comment composer was not rendered');
        }
        const form = feature.element.querySelector<HTMLFormElement>('form');
        if (!form) {
            throw new Error('Comment form was not rendered');
        }
        input.value = ' '.repeat(3);
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        expect(document.body.textContent).toContain('Comment text cannot be empty.');
        expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);

        input.value = '  A useful comment  ';
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
        expect(input.disabled).toBe(true);
        await vi.waitFor(() => {
            expect(feature.element.textContent).toContain('Comments (2)');
            expect(feature.element.textContent).toContain('New post');
        });
        expect(vi.mocked(fetch)).toHaveBeenCalledWith(
            'https://api.example.com/games/cozy-sudoku/comments',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    userEmail: 'ada@example.com',
                    authorName: 'Ada Lovelace',
                    text: 'A useful comment',
                }),
            }),
        );
        expect(input.value).toBe('');
        expect(document.body.textContent).toContain('Comment posted.');
        const avatar = feature.element.querySelector<HTMLElement>(
            ':scope article span[aria-hidden="true"]',
        );
        expect(avatar?.textContent).toBe('É');
        expect(avatar?.dataset.tone).toBe('avatar-random-3');
    });

    it('preserves entered text and reports a failed post with a retryable error message', async () => {
        const { saveAppSession } = await import('@/features/auth/api/auth.api');
        saveAppSession({
            displayName: 'Player',
            email: 'player@example.com',
            authenticatedAt: Date.now(),
        });
        const fetchMock = vi.mocked(fetch);
        fetchMock.mockImplementation(async (_input, init) =>
            init?.method === 'POST'
                ? new Response('', { status: 503 })
                : Response.json({ comments: [comment], totalCount: 1 }),
        );
        const { createComments } = await import('./layout');
        const feature = createComments();
        await feature.load('cozy-sudoku');
        const input = feature.element.querySelector('textarea');
        const form = feature.element.querySelector('form');
        if (!input || !form) {
            throw new Error('Comment composer was not rendered');
        }

        input.value = 'Keep this draft';
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        await vi.waitFor(() => {
            expect(document.body.textContent).toContain(
                'Unable to post comment. Please try again.',
            );
        });
        expect(input.value).toBe('Keep this draft');
        expect(input.disabled).toBe(false);
    });

    it('resizes the textarea up to its cap and preserves line breaks on Enter with Shift', async () => {
        const { saveAppSession } = await import('@/features/auth/api/auth.api');
        saveAppSession({
            displayName: 'Player',
            email: 'player@example.com',
            authenticatedAt: Date.now(),
        });
        const { createComments } = await import('./layout');
        const feature = createComments();
        await feature.load('cozy-sudoku');
        const input = feature.element.querySelector('textarea');
        if (!input) {
            throw new Error('Comment textarea was not rendered');
        }
        Object.defineProperty(input, 'scrollHeight', { configurable: true, value: 180 });
        input.dispatchEvent(new Event('input', { bubbles: true }));
        expect(input.style.height).toBe('120px');
        expect(input.style.overflowY).toBe('auto');

        const shiftedEnter = new KeyboardEvent('keydown', {
            key: 'Enter',
            shiftKey: true,
            bubbles: true,
            cancelable: true,
        });
        input.dispatchEvent(shiftedEnter);
        expect(shiftedEnter.defaultPrevented).toBe(false);
    });

    it('prevents repeated comment likes while a request is pending and updates on success', async () => {
        const { saveAppSession } = await import('@/features/auth/api/auth.api');
        saveAppSession({
            displayName: 'Player',
            email: 'player@example.com',
            authenticatedAt: Date.now(),
        });
        vi.mocked(fetch).mockImplementation(async (input, init) => {
            if (String(input).includes('/like') && init?.method === 'POST') {
                await new Promise<void>((resolve) => {
                    setTimeout(resolve, 0);
                });
                return Response.json({ data: { likesCount: 3, isLikedByCurrentUser: true } });
            }
            return Response.json({ comments: [comment], totalCount: 1 });
        });
        const { createComments } = await import('./layout');
        const feature = createComments();
        await feature.load('cozy-sudoku');
        const likeButton = feature.element.querySelector<HTMLButtonElement>('[data-role="likes"]');
        likeButton?.click();

        const pending = feature.element.querySelector<HTMLButtonElement>('[data-role="likes"]');
        expect(pending?.disabled).toBe(true);
        expect(pending?.getAttribute('aria-busy')).toBe('true');
        pending?.click();
        expect(
            vi.mocked(fetch).mock.calls.filter(([, init]) => init?.method === 'POST'),
        ).toHaveLength(1);
        await vi.waitFor(() => {
            const updated = feature.element.querySelector<HTMLButtonElement>('[data-role="likes"]');
            expect(updated?.getAttribute('aria-pressed')).toBe('true');
            expect(updated?.textContent).toContain('3');
        });
    });

    it('shows the error snackbar and restores the like button after a failed request', async () => {
        const { saveAppSession } = await import('@/features/auth/api/auth.api');
        saveAppSession({
            displayName: 'Player',
            email: 'player@example.com',
            authenticatedAt: Date.now(),
        });
        vi.mocked(fetch).mockImplementation(async (input, init) =>
            String(input).includes('/like') && init?.method === 'POST'
                ? new Response('', { status: 500 })
                : Response.json({ comments: [comment], totalCount: 1 }),
        );
        const { createComments } = await import('./layout');
        const feature = createComments();
        await feature.load('cozy-sudoku');
        feature.element.querySelector<HTMLButtonElement>('[data-role="likes"]')?.click();

        await vi.waitFor(() => {
            expect(document.body.textContent).toContain(
                'Unable to update comment likes right now. Please try again.',
            );
        });
        expect(
            feature.element
                .querySelector<HTMLButtonElement>('[data-role="likes"]')
                ?.getAttribute('aria-busy'),
        ).toBe('false');
    });
});

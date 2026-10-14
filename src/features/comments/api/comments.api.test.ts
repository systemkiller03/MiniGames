import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.resetModules();
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
});

describe('comments.api', () => {
    it('builds comment query parameters and normalizes supported response shapes', async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                Response.json({
                    comments: [{ commentId: 'c-1' }],
                    meta: { totalComments: 7 },
                }),
            )
            .mockResolvedValueOnce(Response.json({ data: [] }));
        vi.stubGlobal('fetch', fetchMock);
        const { getGameCommentsWithMeta } = await import('./comments.api');

        await expect(
            getGameCommentsWithMeta('cozy-sudoku', {
                limit: 3,
                sort: 'newest',
                userEmail: 'ada@example.com',
            }),
        ).resolves.toEqual({ comments: [{ commentId: 'c-1' }], totalCount: 7 });
        expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
            'https://api.example.com/games/cozy-sudoku/comments?limit=3&sort=newest&userEmail=ada%40example.com',
        );
        await expect(getGameCommentsWithMeta('empty')).resolves.toEqual({
            comments: [],
            totalCount: 0,
        });
    });

    it('posts comments and likes with JSON bodies and rejects invalid response payloads', async () => {
        const comment = {
            commentId: 'c-2',
            authorName: 'Ada',
            text: 'Nice!',
            likesCount: 0,
            isLikedByCurrentUser: false,
            createdAt: '2026-01-01T00:00:00Z',
        };
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(Response.json({ data: comment }))
            .mockResolvedValueOnce(
                Response.json({ data: { likesCount: 2, isLikedByCurrentUser: true } }),
            )
            .mockResolvedValueOnce(Response.json({}))
            .mockResolvedValueOnce(Response.json({ data: { likesCount: 'many' } }));
        vi.stubGlobal('fetch', fetchMock);
        const { postGameComment, toggleCommentLike } = await import('./comments.api');
        const payload = { userEmail: 'ada@example.com', authorName: 'Ada', text: 'Nice!' };

        await expect(postGameComment('cozy-sudoku', payload)).resolves.toEqual(comment);
        expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        await expect(toggleCommentLike('c-2', 'ada@example.com')).resolves.toEqual({
            likesCount: 2,
            isLikedByCurrentUser: true,
        });
        expect(fetchMock.mock.calls[1]?.[1]).toMatchObject({
            method: 'POST',
            body: JSON.stringify({ userEmail: 'ada@example.com' }),
        });
        await expect(postGameComment('cozy-sudoku', payload)).rejects.toThrow(
            'Comment not created for cozy-sudoku',
        );
        await expect(toggleCommentLike('c-2', 'ada@example.com')).rejects.toThrow(
            'Comment like state not updated for c-2',
        );
    });
});

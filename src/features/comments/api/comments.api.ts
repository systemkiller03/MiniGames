import { apiClient } from '@/shared/api/api-client';

export type ApiGameComment = {
    commentId: string;
    authorName: string;
    text: string;
    likesCount: number;
    isLikedByCurrentUser: boolean;
    createdAt: string;
};

export type GameCommentsQuery = {
    limit?: number;
    sort?: 'newest' | 'oldest' | string;
    userEmail?: string;
};

export type ApiGameCommentsResult = {
    comments: ApiGameComment[];
    totalCount: number;
};

export type ApiGameCommentSubmitRequest = {
    userEmail: string;
    authorName: string;
    text: string;
};

type GameCommentsResponse = {
    data?: ApiGameComment[];
    comments?: ApiGameComment[];
    totalCount?: number;
    count?: number;
    meta?: {
        totalCount?: number;
        totalComments?: number;
    };
};

type GameCommentSubmitResponse = {
    data?: ApiGameComment;
};

export async function getGameCommentsWithMeta(
    slug: string,
    query: GameCommentsQuery = {},
): Promise<ApiGameCommentsResult> {
    const parameters = new URLSearchParams();

    if (query.limit !== undefined) {
        parameters.set('limit', String(query.limit));
    }

    if (query.sort) {
        parameters.set('sort', query.sort);
    }

    if (query.userEmail) {
        parameters.set('userEmail', query.userEmail);
    }

    const path =
        parameters.size > 0
            ? `/games/${slug}/comments?${parameters.toString()}`
            : `/games/${slug}/comments`;
    const response = await apiClient<GameCommentsResponse>(path);
    const comments = response.data ?? response.comments ?? [];
    const totalCount =
        response.totalCount ??
        response.count ??
        response.meta?.totalCount ??
        response.meta?.totalComments ??
        comments.length;

    return { comments, totalCount };
}

export async function postGameComment(
    slug: string,
    payload: ApiGameCommentSubmitRequest,
): Promise<ApiGameComment> {
    const response = await apiClient<GameCommentSubmitResponse>(`/games/${slug}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    const comment = response.data;
    if (!comment || typeof comment.commentId !== 'string') {
        throw new TypeError(`Comment not created for ${slug}`);
    }

    return comment;
}

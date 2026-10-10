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
};

export type ApiGameCommentsResult = {
    comments: ApiGameComment[];
    totalCount: number;
};

type GameCommentsResponse = {
    data?: ApiGameComment[];
    comments?: ApiGameComment[];
    totalCount?: number;
    count?: number;
    meta?: {
        totalCount?: number;
    };
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

    const path =
        parameters.size > 0
            ? `/games/${slug}/comments?${parameters.toString()}`
            : `/games/${slug}/comments`;
    const response = await apiClient<GameCommentsResponse>(path);
    const comments = response.data ?? response.comments ?? [];
    const totalCount =
        response.totalCount ?? response.count ?? response.meta?.totalCount ?? comments.length;

    return { comments, totalCount };
}

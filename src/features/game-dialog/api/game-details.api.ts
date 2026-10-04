import { apiClient } from '@/shared/api/api-client';

export type ApiGameDetails = {
    slug: string;
    name: string;
    heroImage: string;
    rating: number;
    likesCount: number;
    isLikedByCurrentUser: boolean;
    fullDescription: string;
    specs: {
        genre: string;
        players: string;
        duration: string;
        price: string;
    };
    topRecords: Array<{
        position: number;
        playerName: string;
        score: number;
        achievedAt: string;
    }>;
};

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

type GameDetailsResponse = {
    data?: ApiGameDetails;
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

export async function getGameDetails(slug: string): Promise<ApiGameDetails> {
    const response = await apiClient<GameDetailsResponse>(`/games/${slug}`);

    if (!response.data) {
        throw new Error(`Game details not found for ${slug}`);
    }

    return response.data;
}

export async function getGameComments(
    slug: string,
    query: GameCommentsQuery = {},
): Promise<ApiGameComment[]> {
    const result = await getGameCommentsWithMeta(slug, query);
    return result.comments;
}

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

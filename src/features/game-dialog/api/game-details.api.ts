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

type GameDetailsResponse = {
    data?: ApiGameDetails;
};

export async function getGameDetails(slug: string): Promise<ApiGameDetails> {
    const response = await apiClient<GameDetailsResponse>(`/games/${slug}`);

    if (!response.data) {
        throw new Error(`Game details not found for ${slug}`);
    }

    return response.data;
}

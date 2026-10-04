import { apiClient } from '@/shared/api/api-client';

export type ApiFeaturedGame = {
    slug: string;
    name: string;
    category: string;
    price: string;
    shortDescription: string;
    rating: number;
    likesCount: number;
    cardImage: string;
};

type FeaturedGamesResponse = {
    data?: ApiFeaturedGame[];
};

export async function getFeaturedGames(): Promise<ApiFeaturedGame[]> {
    const response = await apiClient<FeaturedGamesResponse>('/games?featured=true');

    return response.data ?? [];
}

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

export type ApiFavoriteToggleResult = {
    isFavorited: boolean;
    likesCount: number;
};

type GameDetailsResponse = {
    data?: ApiGameDetails;
};

type FavoriteToggleResponse = {
    data?: ApiFavoriteToggleResult;
};

export async function getGameDetails(slug: string, userEmail?: string): Promise<ApiGameDetails> {
    const searchParameters = new URLSearchParams();
    if (userEmail) {
        searchParameters.set('userEmail', userEmail);
    }

    const path =
        searchParameters.size > 0
            ? `/games/${slug}?${searchParameters.toString()}`
            : `/games/${slug}`;
    const response = await apiClient<GameDetailsResponse>(path);

    if (!response.data) {
        throw new TypeError(`Game details not found for ${slug}`);
    }

    return response.data;
}

export async function toggleGameFavorite(
    slug: string,
    userEmail: string,
): Promise<ApiFavoriteToggleResult> {
    const response = await apiClient<FavoriteToggleResponse>(`/games/${slug}/favorite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail }),
    });

    const favoriteState = response.data ?? {
        isFavorited: false,
        likesCount: 0,
    };

    if (
        typeof favoriteState.isFavorited !== 'boolean' ||
        typeof favoriteState.likesCount !== 'number'
    ) {
        throw new TypeError(`Favorite state not returned for ${slug}`);
    }

    return favoriteState;
}

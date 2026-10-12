import { apiClient } from '@/shared/api/api-client';

export type ApiLibraryGame = {
    slug: string;
    name: string;
    category: string;
    price: string;
    shortDescription: string;
    rating: number;
    likesCount: number;
    cardImage: string;
};

type LibraryGamesResponse = {
    data?: ApiLibraryGame[];
    meta?: {
        page?: number;
        totalPages?: number;
    };
};

const PAGE_SIZE = 6;

export type ApiLibraryGamesPage = {
    data: ApiLibraryGame[];
    page: number;
    totalPages: number;
};

export async function getLibraryGames(parameters?: {
    category?: string;
    sort?: string;
    page?: number;
    limit?: number;
}): Promise<ApiLibraryGamesPage> {
    const searchParameters = new URLSearchParams({
        category: parameters?.category ?? 'all',
        sort: parameters?.sort ?? 'rating-desc',
        page: String(parameters?.page ?? 1),
        limit: String(parameters?.limit ?? PAGE_SIZE),
    });

    const response = await apiClient<LibraryGamesResponse>(`/games?${searchParameters.toString()}`);
    const { data } = response;
    const { page, totalPages } = response.meta ?? {};
    const lastPage = typeof totalPages === 'number' ? Math.max(1, totalPages) : 1;
    if (
        typeof page !== 'number' ||
        typeof totalPages !== 'number' ||
        !Array.isArray(data) ||
        !Number.isSafeInteger(page) ||
        page < 1 ||
        !Number.isSafeInteger(totalPages) ||
        totalPages < 0 ||
        (page > lastPage && data.length > 0)
    ) {
        throw new Error('Invalid games response: expected data, page, and totalPages');
    }

    return {
        data,
        page: Math.min(page, lastPage),
        totalPages,
    };
}

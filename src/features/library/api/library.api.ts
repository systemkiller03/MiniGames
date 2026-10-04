import { apiClient } from '@/shared/api/api-client';

export type ApiLibraryCategory = {
    slug: string;
    label: string;
    isDefault: boolean;
};

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

type LibraryCategoriesResponse = {
    data?: ApiLibraryCategory[];
};

type LibraryGamesResponse = {
    data?: ApiLibraryGame[];
};

const PAGE_SIZE = 6;

export async function getLibraryCategories(): Promise<ApiLibraryCategory[]> {
    const response = await apiClient<LibraryCategoriesResponse>('/categories');
    return response.data ?? [];
}

export async function getLibraryGames(parameters?: {
    category?: string;
    sort?: string;
    page?: number;
    limit?: number;
}): Promise<ApiLibraryGame[]> {
    const searchParameters = new URLSearchParams({
        category: parameters?.category ?? 'all',
        sort: parameters?.sort ?? 'rating-desc',
        page: String(parameters?.page ?? 1),
        limit: String(parameters?.limit ?? PAGE_SIZE),
    });

    const response = await apiClient<LibraryGamesResponse>(`/games?${searchParameters.toString()}`);
    return response.data ?? [];
}

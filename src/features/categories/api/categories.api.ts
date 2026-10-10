import { apiClient } from '@/shared/api/api-client';

export type ApiLibraryCategory = {
    slug: string;
    label: string;
    isDefault: boolean;
};

type CategoriesResponse = {
    data?: ApiLibraryCategory[];
};

export async function getLibraryCategories(): Promise<ApiLibraryCategory[]> {
    const response = await apiClient<CategoriesResponse>('/categories');
    if (!Array.isArray(response.data)) {
        throw new TypeError('Invalid categories response: expected data');
    }

    return response.data;
}

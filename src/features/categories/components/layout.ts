import { createCategories } from './categories';
import { createCategoriesLoadingState } from './loading';
export { createCategories } from './categories';
export { createCategoriesErrorState } from './error';
export { createCategoriesLoadingState } from './loading';
export { getLibraryCategories } from '../api/categories.api';
export type { ApiLibraryCategory } from '../api/categories.api';

export function createCategoriesLayout(onSelect: (categorySlug: string) => void): HTMLUListElement {
    const categories = createCategories([], 'all', onSelect);
    categories.dataset.state = 'loading';
    categories.append(createCategoriesLoadingState());
    return categories;
}

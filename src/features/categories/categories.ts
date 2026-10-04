import './categories.scss';
import type { ApiLibraryCategory } from '@/features/library/api/library.api';
import { createFilterChip } from '@/shared/components';

export function createCategories(
    categories: ApiLibraryCategory[],
    selectedCategory: string,
    onSelect: (categorySlug: string) => void,
) {
    const list = document.createElement('ul');
    list.classList.add('categories');

    for (const category of categories) {
        const categoryItem = document.createElement('li');
        const chip = createFilterChip({
            children: category.label,
            selected: category.slug === selectedCategory,
            onClick: () => onSelect(category.slug),
        });
        categoryItem.append(chip);
        list.append(categoryItem);
    }

    return list;
}

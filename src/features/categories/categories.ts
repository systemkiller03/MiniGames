import './categories.scss';
import { createFilterChip } from '@/shared/components';

export function createCategories(labels: string[]) {
    const categories = document.createElement('ul');
    categories.classList.add('categories');
    for (const label of labels) {
        const category = document.createElement('li');
        const chip = createFilterChip({
            children: label,
            selected: label === 'All Games',
            onClick: () => {
                for (const otherChip of categories.querySelectorAll('button')) {
                    otherChip.setAttribute('aria-pressed', String(otherChip === chip));
                }
            },
        });
        category.append(chip);
        categories.append(category);
    }
    return categories;
}

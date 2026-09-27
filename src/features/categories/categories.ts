import'./categories.scss';

export function createCategories(labels: string[]){
    const categories = document.createElement('ul');
    categories.classList.add('categories');
    for(const label of labels){
        const category = document.createElement('li');
        const chip = document.createElement('button');
        chip.classList.add('category-chip');
        chip.type = 'button';
        chip.textContent = label;
        chip.setAttribute('aria-pressed', 'false');
        chip.addEventListener('click', () => {
            for(const otherChip of categories.querySelectorAll('.category-chip')){
                const isActive = otherChip === chip;
                otherChip.classList.toggle('active', isActive);
                otherChip.setAttribute('aria-pressed', String(isActive));
            }
        });
        category.append(chip);
        categories.append(category);
    }
    return categories;
}

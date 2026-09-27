import'./categories.scss';

export function createCategories(labels: string[]){
    const categories = document.createElement('ul');
    categories.classList.add('categories');
    for(const label of labels){
        const category = document.createElement('li');
        category.textContent = label;
        category.addEventListener('click', () => {
            category.classList.toggle('active');
        });
        categories.append(category);
    }
    return categories;
}

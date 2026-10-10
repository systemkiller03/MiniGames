export function createCategoriesLoadingState(): HTMLLIElement {
    const item = document.createElement('li');
    const state = document.createElement('div');
    state.className = 'categories-state';
    state.dataset.state = 'loading';
    state.setAttribute('role', 'status');
    state.setAttribute('aria-busy', 'true');
    state.textContent = 'Loading categories';
    item.append(state);
    return item;
}

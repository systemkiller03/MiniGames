import { createButton } from '@/shared/components';

export function createCategoriesErrorState(onRetry: () => void): HTMLLIElement {
    const item = document.createElement('li');
    const state = document.createElement('div');
    state.className = 'categories-state';
    state.dataset.state = 'error';
    state.setAttribute('role', 'alert');

    const title = document.createElement('span');
    title.textContent = 'Could not load categories';
    const retryButton = createButton({ label: 'Retry', variant: 'primary', size: 'sm' });
    retryButton.addEventListener('click', onRetry);
    state.append(title, retryButton);
    item.append(state);
    return item;
}

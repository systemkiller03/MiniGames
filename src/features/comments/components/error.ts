import { createButton } from '@/shared/components';

export function createCommentsErrorState(onRetry: () => void): HTMLElement {
    const state = document.createElement('div');
    state.className = 'comments-state';
    state.dataset.state = 'error';
    state.setAttribute('role', 'alert');

    const title = document.createElement('h4');
    title.textContent = 'Could not load comments';

    const details = document.createElement('p');
    details.textContent = 'Comments could not be loaded. Please try again.';

    const retryButton = createButton({ label: 'Retry', variant: 'primary', size: 'sm' });
    retryButton.addEventListener('click', onRetry);

    state.append(title, details, retryButton);
    return state;
}

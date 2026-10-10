import { createButton } from '@/shared/components';

export function createErrorState(onRetry: () => void): HTMLElement {
    const state = document.createElement('div');
    state.className = 'library-state';
    state.dataset.state = 'error';
    state.setAttribute('role', 'alert');

    const title = document.createElement('h3');
    title.textContent = 'Could not load games';
    const details = document.createElement('p');
    details.textContent = 'The server did not respond successfully. Please retry.';
    const retryButton = createButton({ label: 'Retry', variant: 'primary', size: 'sm' });
    retryButton.addEventListener('click', onRetry);
    state.append(title, details, retryButton);
    return state;
}

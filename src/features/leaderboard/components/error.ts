import { createButton } from '@/shared/components';

export function createErrorState(onRetry: () => void): HTMLElement {
    const state = document.createElement('div');
    state.className = 'leaderboard-state';
    state.dataset.state = 'error';
    state.setAttribute('role', 'alert');

    const title = document.createElement('h3');
    title.textContent = 'Could not load leaderboard';

    const details = document.createElement('p');
    details.textContent = 'The leaderboard server did not respond successfully.';

    const retryButton = createButton({ label: 'Retry', variant: 'primary', size: 'sm' });
    retryButton.addEventListener('click', onRetry);

    state.append(title, details, retryButton);
    return state;
}

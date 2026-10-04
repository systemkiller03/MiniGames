export function createEmptyState(): HTMLElement {
    const state = document.createElement('div');
    state.className = 'leaderboard-state';
    state.dataset.state = 'empty';
    state.setAttribute('role', 'status');

    const title = document.createElement('h3');
    title.textContent = 'No players found';

    const details = document.createElement('p');
    details.textContent = 'The leaderboard is empty right now. Please check back later.';

    state.append(title, details);
    return state;
}

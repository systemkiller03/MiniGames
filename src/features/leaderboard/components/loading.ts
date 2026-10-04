export function createLoadingState(): HTMLElement {
    const state = document.createElement('div');
    state.className = 'leaderboard-state leaderboard-loading';
    state.dataset.state = 'loading';
    state.setAttribute('role', 'status');
    state.setAttribute('aria-busy', 'true');

    const title = document.createElement('h3');
    title.textContent = 'Loading leaderboard';

    const rows = document.createElement('div');
    rows.className = 'leaderboard-loading-rows';
    for (let index = 0; index < 5; index += 1) {
        const row = document.createElement('div');
        row.className = 'leaderboard-loading-row';
        rows.append(row);
    }

    state.append(title, rows);
    return state;
}

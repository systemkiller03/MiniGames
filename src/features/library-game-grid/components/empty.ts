export function createEmptyState(): HTMLElement {
    const state = document.createElement('div');
    state.className = 'library-state';
    state.dataset.state = 'empty';
    state.setAttribute('role', 'status');

    const title = document.createElement('h3');
    title.textContent = 'No games found';
    const details = document.createElement('p');
    details.textContent = 'There are no games available right now. Try again later.';
    state.append(title, details);
    return state;
}

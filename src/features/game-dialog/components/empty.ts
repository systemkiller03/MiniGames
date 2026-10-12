export function createEmptyState(
    message = 'No game details are available right now.',
): HTMLElement {
    const state = document.createElement('div');
    state.className = 'game-dialog-state';
    state.dataset.state = 'empty';
    state.setAttribute('role', 'status');

    const title = document.createElement('h3');
    title.textContent = 'No details found';

    const details = document.createElement('p');
    details.textContent = message;

    state.append(title, details);
    return state;
}

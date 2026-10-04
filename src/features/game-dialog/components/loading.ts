export function createLoadingState(): HTMLElement {
    const state = document.createElement('div');
    state.className = 'game-dialog-state';
    state.dataset.state = 'loading';
    state.setAttribute('role', 'status');
    state.setAttribute('aria-live', 'polite');
    state.setAttribute('aria-busy', 'true');

    const title = document.createElement('h3');
    title.textContent = 'Loading game details';

    const shimmer = document.createElement('div');
    shimmer.className = 'game-dialog-loading';
    for (let index = 0; index < 5; index += 1) {
        const line = document.createElement('span');
        line.className = 'game-dialog-loading-line';
        shimmer.append(line);
    }

    state.append(title, shimmer);
    return state;
}

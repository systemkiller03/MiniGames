export function createCommentsLoadingState(): HTMLElement {
    const state = document.createElement('div');
    state.className = 'comments-loading';
    state.dataset.state = 'loading';
    state.setAttribute('role', 'status');
    state.textContent = 'Loading comments…';
    return state;
}

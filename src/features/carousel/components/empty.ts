export function createEmptyState(): HTMLElement {
    const state = document.createElement('div');
    state.className = 'carousel-state';
    state.dataset.state = 'empty';
    state.setAttribute('role', 'status');

    const title = document.createElement('h3');
    title.textContent = 'No featured games found';
    const details = document.createElement('p');
    details.textContent = 'Check back later for new recommendations.';
    state.append(title, details);
    return state;
}

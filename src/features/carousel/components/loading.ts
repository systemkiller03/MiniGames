export function createLoadingState(): HTMLElement {
    const state = document.createElement('div');
    state.className = 'carousel-state carousel-loading';
    state.dataset.state = 'loading';
    state.setAttribute('role', 'status');
    state.setAttribute('aria-busy', 'true');

    const title = document.createElement('h3');
    title.textContent = 'Loading featured games';
    const cards = document.createElement('div');
    cards.className = 'carousel-loading-cards';
    for (let index = 0; index < 5; index += 1) {
        const card = document.createElement('div');
        card.className = 'carousel-loading-card';
        cards.append(card);
    }
    state.append(title, cards);
    return state;
}

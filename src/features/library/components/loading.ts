export function createLoadingState(): HTMLElement {
    const state = document.createElement('div');
    state.className = 'library-loading';
    state.dataset.state = 'loading';
    state.setAttribute('role', 'status');
    state.setAttribute('aria-busy', 'true');

    const title = document.createElement('h3');
    title.textContent = 'Loading games';

    const cards = document.createElement('div');
    cards.className = 'library-loading-cards';
    for (let index = 0; index < 6; index += 1) {
        const card = document.createElement('div');
        card.className = 'library-loading-card';
        card.setAttribute('aria-hidden', 'true');
        cards.append(card);
    }

    state.append(title, cards);
    return state;
}

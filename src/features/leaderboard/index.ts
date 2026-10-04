import './styles/leaderboard.scss';
import { getLeaderboardPlayers } from './api/leaderboard.api';
import { createEmptyState } from './components/empty';
import { createErrorState } from './components/error';
import { createLeaderboardLayout } from './components/layout';
import { createLoadingState } from './components/loading';
import { renderLeaderboardTable } from './components/leaderboard';

export function createLeaderboard(): HTMLElement {
    const layout = createLeaderboardLayout();

    const snackbar = document.createElement('div');
    snackbar.className = 'leaderboard-snackbar';
    snackbar.setAttribute('role', 'status');
    snackbar.setAttribute('aria-live', 'polite');

    const loadLeaderboard = async (): Promise<void> => {
        layout.tableWrap.replaceChildren(createLoadingState());

        try {
            const players = await getLeaderboardPlayers();

            if (players.length === 0) {
                layout.tableWrap.replaceChildren(createEmptyState());
                return;
            }

            layout.tableWrap.replaceChildren(renderLeaderboardTable(players));
        } catch {
            snackbar.textContent = 'Unable to load leaderboard. Please try again.';
            snackbar.dataset.variant = 'error';
            snackbar.classList.add('is-visible');
            globalThis.setTimeout(() => snackbar.classList.remove('is-visible'), 3200);
            layout.tableWrap.replaceChildren(createErrorState(() => void loadLeaderboard()));
        }
    };

    layout.element.append(snackbar);
    void loadLeaderboard();
    return layout.element;
}

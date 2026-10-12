import './styles/leaderboard.scss';
import { getLeaderboardPlayers } from './api/leaderboard.api';
import { createEmptyState } from './components/empty';
import { createErrorState } from './components/error';
import { createLeaderboardLayout } from './components/layout';
import { createLoadingState } from './components/loading';
import { renderLeaderboardTable } from './components/leaderboard';
import { createSnackbar } from '@/shared/components';

export function createLeaderboard(): HTMLElement {
    const layout = createLeaderboardLayout();
    const snackbar = createSnackbar();

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
            snackbar.show('Unable to load leaderboard. Please try again.', 'error');
            layout.tableWrap.replaceChildren(createErrorState(() => void loadLeaderboard()));
        }
    };

    layout.element.append(snackbar.element);
    void loadLeaderboard();
    return layout.element;
}

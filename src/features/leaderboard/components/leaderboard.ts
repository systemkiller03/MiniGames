import type { ApiLeaderboardPlayer } from '../api/leaderboard.api';

const AVATAR_COLORS = ['#ffd02b', '#a3e2c9', '#bce3ff', '#ffc6ff', '#e8dff5', '#f6c28b'];

function getInitials(name: string): string {
    const parts = name.split(/[_\s-]+/).filter(Boolean);
    return (
        parts
            .slice(0, 2)
            .map((part) => part[0]?.toUpperCase() ?? '')
            .join('') || 'PL'
    );
}

function getAvatarColor(name: string): string {
    const hash = [...name].reduce((total, character) => total + (character.codePointAt(0) ?? 0), 0);
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
}

export function renderLeaderboardTable(players: ApiLeaderboardPlayer[]): HTMLTableElement {
    const table = document.createElement('table');

    const caption = document.createElement('caption');
    caption.textContent = 'Top players ranked by weekly score';

    const head = document.createElement('thead');
    const headerRow = document.createElement('tr');
    for (const label of [
        'Rank',
        'Player',
        'Games Played',
        'Total Score',
        'Streak',
        'Favorite Game',
    ]) {
        const cell = document.createElement('th');
        cell.scope = 'col';
        cell.textContent = label;
        headerRow.append(cell);
    }
    head.append(headerRow);

    const body = document.createElement('tbody');
    for (const player of players) {
        const row = document.createElement('tr');

        const rank = document.createElement('td');
        rank.textContent = `#${player.rank}`;

        const playerCell = document.createElement('td');
        const avatar = document.createElement('span');
        avatar.style.setProperty('--avatar-color', getAvatarColor(player.playerName));
        avatar.textContent = getInitials(player.playerName);

        const name = document.createElement('span');
        name.textContent = player.playerName;
        playerCell.append(avatar, name);

        const games = document.createElement('td');
        games.textContent = formatNumber(player.gamesPlayed);

        const score = document.createElement('td');
        score.textContent = formatNumber(player.totalScore);

        const streak = document.createElement('td');
        streak.textContent = `🔥 ${player.streakDays} day${player.streakDays === 1 ? '' : 's'}`;

        const favoriteCell = document.createElement('td');
        const favorite = document.createElement('span');
        favorite.textContent = player.favoriteGameName || 'N/A';
        favoriteCell.append(favorite);

        row.append(rank, playerCell, games, score, streak, favoriteCell);
        body.append(row);
    }

    table.append(caption, head, body);
    return table;
}

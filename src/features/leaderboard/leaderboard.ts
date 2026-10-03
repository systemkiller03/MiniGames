import './leaderboard.scss';

const PLAYERS = [
    {
        name: 'Alex_Pro99',
        games: '142',
        score: '94,250',
        streak: '12 days',
        favorite: 'Heartopia',
        initials: 'AP',
        color: '#ffd02b',
    },
    {
        name: 'CozyGamer_x',
        games: '118',
        score: '81,400',
        streak: '8 days',
        favorite: 'Cat Mail Co.',
        initials: 'CG',
        color: '#a3e2c9',
    },
    {
        name: 'MatchMaster',
        games: '98',
        score: '72,110',
        streak: '5 days',
        favorite: 'Tiny Glade',
        initials: 'MM',
        color: '#bce3ff',
    },
    {
        name: 'BubblePop',
        games: '87',
        score: '65,900',
        streak: '3 days',
        favorite: 'Whisper of the House',
        initials: 'BP',
        color: '#ffc6ff',
    },
    {
        name: 'SudokuGod',
        games: '74',
        score: '59,320',
        streak: '2 days',
        favorite: 'Cat Chess',
        initials: 'SG',
        color: '#e8dff5',
    },
];

export function createLeaderboard(): HTMLElement {
    const section = document.createElement('section');
    section.className = 'leaderboard';
    section.setAttribute('aria-labelledby', 'leaderboard-title');

    const title = document.createElement('h2');
    title.id = 'leaderboard-title';
    title.textContent = 'Top Players This Week';

    const tableWrap = document.createElement('div');
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
    for (const [index, player] of PLAYERS.entries()) {
        const row = document.createElement('tr');
        const rank = document.createElement('td');
        rank.textContent = `#${index + 1}`;

        const playerCell = document.createElement('td');
        const avatar = document.createElement('span');
        avatar.style.setProperty('--avatar-color', player.color);
        avatar.textContent = player.initials;
        const name = document.createElement('span');
        name.textContent = player.name;
        playerCell.append(avatar, name);

        const games = document.createElement('td');
        games.textContent = player.games;
        const score = document.createElement('td');
        score.textContent = player.score;
        const streak = document.createElement('td');
        streak.textContent = `🔥 ${player.streak}`;

        const favoriteCell = document.createElement('td');
        const favorite = document.createElement('span');
        favorite.textContent = player.favorite;
        favoriteCell.append(favorite);

        row.append(rank, playerCell, games, score, streak, favoriteCell);
        body.append(row);
    }

    table.append(caption, head, body);
    tableWrap.append(table);
    section.append(title, tableWrap);
    return section;
}

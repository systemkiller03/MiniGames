export type LeaderboardLayout = {
    element: HTMLElement;
    title: HTMLHeadingElement;
    tableWrap: HTMLDivElement;
};

export function createLeaderboardLayout(): LeaderboardLayout {
    const element = document.createElement('section');
    element.className = 'leaderboard';
    element.setAttribute('aria-labelledby', 'leaderboard-title');

    const title = document.createElement('h2');
    title.id = 'leaderboard-title';
    title.textContent = 'Top Players This Week';

    const tableWrap = document.createElement('div');
    tableWrap.className = 'leaderboard-table-wrap';

    element.append(title, tableWrap);
    return { element, title, tableWrap };
}

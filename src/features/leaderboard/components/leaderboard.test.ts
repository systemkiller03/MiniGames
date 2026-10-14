import { describe, expect, it } from 'vitest';

import { renderLeaderboardTable } from './leaderboard';

describe('renderLeaderboardTable', () => {
    it('formats ranks, numbers, streak plurals, and deterministic name avatars', () => {
        const table = renderLeaderboardTable([
            {
                rank: 1,
                playerName: 'ada_lovelace',
                gamesPlayed: 1200,
                totalScore: 1_234_567,
                streakDays: 1,
                favoriteGameName: '',
            },
            {
                rank: 2,
                playerName: 'ada_lovelace',
                gamesPlayed: 3,
                totalScore: 4,
                streakDays: 4,
                favoriteGameName: 'Tiny Glade',
            },
        ]);
        const rows = table.querySelectorAll(':scope tbody tr');
        const avatarOne = rows[0]?.querySelector(':scope td:nth-child(2) span');
        const avatarTwo = rows[1]?.querySelector(':scope td:nth-child(2) span');

        expect(table.querySelector(':scope caption')?.textContent).toContain('weekly score');
        expect(rows[0]?.textContent).toContain('#1');
        expect(rows[0]?.textContent).toContain('1,200');
        expect(rows[0]?.textContent).toContain('1,234,567');
        expect(rows[0]?.textContent).toContain('1 day');
        expect(rows[0]?.textContent).toContain('N/A');
        expect(rows[1]?.textContent).toContain('4 days');
        expect(rows[1]?.textContent).toContain('Tiny Glade');
        expect(avatarOne?.textContent).toBe('AL');
        expect(avatarOne?.getAttribute('style')).toBe(avatarTwo?.getAttribute('style'));
    });

    it('falls back to player initials when a name has no word characters', () => {
        const table = renderLeaderboardTable([
            {
                rank: 1,
                playerName: '---',
                gamesPlayed: 0,
                totalScore: 0,
                streakDays: 0,
                favoriteGameName: '',
            },
        ]);

        expect(table.querySelector(':scope tbody tr td:nth-child(2) span')?.textContent).toBe('PL');
    });
});

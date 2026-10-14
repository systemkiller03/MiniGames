import { describe, expect, it } from 'vitest';

import { createLeaderboardLayout } from './layout';

describe('createLeaderboardLayout', () => {
    it('provides a labelled leaderboard section and its table container', () => {
        const layout = createLeaderboardLayout();

        expect(layout.element.getAttribute('aria-labelledby')).toBe('leaderboard-title');
        expect(layout.title.textContent).toBe('Top Players This Week');
        expect(layout.tableWrap.parentElement).toBe(layout.element);
    });
});

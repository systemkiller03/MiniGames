import { describe, expect, it } from 'vitest';

import { createDescription } from './layout';

describe('createDescription', () => {
    it('displays the supplied section heading and description', () => {
        const description = createDescription('Game Library', 'Browse the collection.');

        expect(description.querySelector('h2')?.textContent).toBe('Game Library');
        expect(description.querySelector('p')?.textContent).toBe('Browse the collection.');
    });
});

import { describe, expect, it } from 'vitest';

import { createProfileState } from './profile';

describe('createProfileState', () => {
    it.each([
        ['  Ada  ', 'ada@example.com', 'A'],
        ['Ada Lovelace Byron', 'ada@example.com', 'AL'],
        ['', 'ada@example.com', 'A'],
        [' \t\n ', ' ', 'P'],
        ['💫 Élodie', 'elodie@example.com', 'É'],
        [' '.repeat(3), '  player@example.com  ', 'P'],
    ])('derives visible initials for display name %s', (displayName, email, initials) => {
        const profile = createProfileState({
            displayName,
            email,
            authenticatedAt: 1,
        });

        expect(profile.querySelector('.profile-state__name')?.textContent).toBe(
            displayName.trim() || email.trim().split('@', 1)[0] || 'Player',
        );
        expect(
            profile.querySelector<HTMLElement>(':scope .profile-state__fallback')?.textContent,
        ).toBe(initials);
        expect(profile.querySelector<HTMLElement>(':scope .profile-state__fallback')?.hidden).toBe(
            false,
        );
        expect(profile.querySelector('button[data-auth-action="logout"]')?.textContent).toBe(
            'Log Out',
        );
    });

    it('shows an avatar image after load and falls back to initials after an image error', () => {
        const profile = createProfileState({
            displayName: 'Ada Lovelace',
            email: 'ada@example.com',
            authenticatedAt: 1,
            avatarUrl: 'https://example.com/avatar.png',
        });
        const image = profile.querySelector('img');
        const fallback = profile.querySelector<HTMLElement>(':scope .profile-state__fallback');

        expect(image?.hidden).toBe(false);
        expect(fallback?.hidden).toBe(false);
        image?.dispatchEvent(new Event('load'));
        expect(image?.hidden).toBe(false);
        expect(fallback?.hidden).toBe(true);
        image?.dispatchEvent(new Event('error'));
        expect(image?.hidden).toBe(true);
        expect(fallback?.textContent).toBe('AL');
        expect(fallback?.hidden).toBe(false);
    });
});

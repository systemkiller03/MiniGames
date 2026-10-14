import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'home-test');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    document.body.replaceChildren();
});

describe('createHomePage', () => {
    it('composes the hero, carousel, leaderboard, and developer contact sections', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn(async () => Response.json({ data: [] })),
        );
        const { createHomePage } = await import('./index');
        const page = createHomePage();

        expect(page.className).toBe('home-page');
        expect(page.querySelector(':scope .hero h1')?.textContent).toContain('Have Fun');
        expect(page.querySelector(':scope .carousel h2')?.textContent).toBe('New Games');
        expect(page.querySelector(':scope .leaderboard h2')?.textContent).toBe(
            'Top Players This Week',
        );
        expect(page.querySelector(':scope .developer h2')?.textContent).toBe(
            'Are You a Game Developer?',
        );
        await vi.waitFor(() => {
            expect(page.querySelectorAll('[data-state="empty"]')).toHaveLength(2);
        });
    });
});

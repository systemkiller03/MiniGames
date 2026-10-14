import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_API_URL', 'https://api.example.com');
    vi.stubEnv('VITE_FIREBASE_API_KEY', 'key');
    vi.stubEnv('VITE_FIREBASE_AUTH_DOMAIN', 'example.firebaseapp.com');
    vi.stubEnv('VITE_FIREBASE_PROJECT_ID', 'library-page');
    vi.stubEnv('VITE_FIREBASE_APP_ID', 'app-id');
    vi.stubGlobal(
        'fetch',
        vi.fn(async (input) =>
            String(input).endsWith('/categories')
                ? Response.json({ data: [{ slug: 'all', label: 'All', isDefault: true }] })
                : Response.json({ data: [], meta: { page: 1, totalPages: 1 } }),
        ),
    );
});

afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    document.body.replaceChildren();
});

describe('createLibraryPage', () => {
    it('composes library controls and displays an empty games response', async () => {
        const { createLibraryPage } = await import('./index');
        const page = createLibraryPage();

        expect(page.textContent).toContain('Game Library');
        expect(page.querySelector('.sort-dropdown')).not.toBeNull();
        expect(page.querySelector('.pagination')).not.toBeNull();
        await vi.waitFor(() => {
            expect(page.querySelector('[data-state="empty"]')?.textContent).toContain(
                'No games found',
            );
        });
    });
});

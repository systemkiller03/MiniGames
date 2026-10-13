import { afterEach, describe, expect, it, vi } from 'vitest';

import { createSnackbar } from './snackbar';

afterEach(() => {
    vi.useRealTimers();
});

describe('createSnackbar', () => {
    it('announces error messages assertively and hides them after the timeout', () => {
        vi.useFakeTimers();
        const snackbar = createSnackbar();
        snackbar.show('Unable to save.', 'error');

        expect(snackbar.element.textContent).toContain('Unable to save.');
        expect(snackbar.element.getAttribute('role')).toBe('alert');
        expect(snackbar.element.getAttribute('aria-live')).toBe('assertive');
        expect(snackbar.element.dataset.variant).toBe('error');
        expect(snackbar.element.classList.contains('is-visible')).toBe(true);
        expect(snackbar.element.querySelector('button')?.disabled).toBe(false);

        vi.advanceTimersByTime(3200);
        expect(snackbar.element.classList.contains('is-visible')).toBe(false);
        expect(snackbar.element.querySelector('button')?.disabled).toBe(true);
    });

    it('replaces a success message and allows the user to hide it', () => {
        vi.useFakeTimers();
        const snackbar = createSnackbar();
        snackbar.show('Saved.', 'success');
        snackbar.show('Updated.', 'loading');

        expect(snackbar.element.textContent).toContain('Updated.');
        expect(snackbar.element.dataset.variant).toBe('loading');
        expect(snackbar.element.getAttribute('role')).toBe('status');
        snackbar.element.querySelector('button')?.click();
        expect(snackbar.element.classList.contains('is-visible')).toBe(false);
    });
});

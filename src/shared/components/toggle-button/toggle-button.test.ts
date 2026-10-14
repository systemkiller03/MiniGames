import { describe, expect, it, vi } from 'vitest';

import { createToggleButton } from './toggle-button';

describe('createToggleButton', () => {
    it('updates pressed state, count, label, and callback when toggled', () => {
        const onToggle = vi.fn();
        const button = createToggleButton({ count: 12, onToggle });

        expect(button.getAttribute('aria-pressed')).toBe('false');
        expect(button.getAttribute('aria-label')).toBe('Add to Favorites, 12 likes');
        expect(button.textContent).toBe('Add to Favorites12');
        button.click();
        expect(button.getAttribute('aria-pressed')).toBe('true');
        expect(button.getAttribute('aria-label')).toBe('Remove from Favorites, 12 likes');
        expect(button.textContent).toBe('Remove from Favorites12');
        expect(onToggle).toHaveBeenCalledWith(true);
    });

    it('omits the text label in icon-only mode and supports a custom disabled pressed state', () => {
        const button = createToggleButton({
            pressed: true,
            iconOnly: true,
            labelOn: 'Saved',
            count: 0,
            disabled: true,
        });

        expect(button.disabled).toBe(true);
        expect(button.dataset.pressed).toBe('true');
        expect(button.getAttribute('aria-label')).toBe('Saved, 0 likes');
        expect(button.querySelectorAll('span')).toHaveLength(1);
        expect(button.querySelector('span')?.textContent).toBe('0');
        expect(button.querySelector('svg')).not.toBeNull();
    });
});

import { describe, expect, it } from 'vitest';
import { X } from 'lucide';

import { createIconButton } from './icon-button';

describe('createIconButton', () => {
    it('renders string icons and applies accessible state options', () => {
        const button = createIconButton('Close dialog', '×', {
            size: 'sm',
            shape: 'circle',
            tone: 'dark',
            variant: 'surface',
            disabled: true,
        });

        expect(button.textContent).toBe('×');
        expect(button.getAttribute('aria-label')).toBe('Close dialog');
        expect(button.dataset).toMatchObject({
            size: 'sm',
            shape: 'circle',
            tone: 'dark',
            variant: 'surface',
        });
        expect(button.disabled).toBe(true);
    });

    it('renders Lucide icons and uses defaults when options are omitted', () => {
        const button = createIconButton('Dismiss', X);

        expect(button.querySelector('svg')).not.toBeNull();
        expect(button.dataset).toMatchObject({
            size: 'md',
            shape: 'square',
            tone: 'light',
            variant: 'plain',
        });
    });
});

import { describe, expect, it } from 'vitest';

import { createButton } from './button';

describe('createButton', () => {
    it('applies defaults, button text, and accessible semantic type', () => {
        const button = createButton({ label: 'Save' });

        expect(button.tagName).toBe('BUTTON');
        expect(button.type).toBe('button');
        expect(button.textContent).toBe('Save');
        expect(button.dataset.variant).toBe('primary');
        expect(button.dataset.size).toBe('md');
        expect(button.disabled).toBe(false);
    });

    it('renders optional icons and only enables shadow at large size', () => {
        const leading = document.createElement('span');
        leading.textContent = 'L';
        const trailing = document.createElement('span');
        trailing.textContent = 'R';
        const button = createButton({
            label: 'Send',
            iconLeft: leading,
            icon: trailing,
            variant: 'outline',
            size: 'lg',
            fullWidth: true,
            shadow: true,
            disabled: true,
            type: 'submit',
        });
        const smallShadow = createButton({ size: 'sm', shadow: true });

        expect(button.textContent).toBe('LSendR');
        expect(button.type).toBe('submit');
        expect(button.disabled).toBe(true);
        expect(button.dataset).toMatchObject({
            variant: 'outline',
            size: 'lg',
            fullWidth: '',
            shadow: '',
        });
        expect(Object.hasOwn(smallShadow.dataset, 'shadow')).toBe(false);
    });
});

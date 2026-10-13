import { describe, expect, it } from 'vitest';
import { Eye } from 'lucide';

import { createAuthField } from './auth-field';

describe('createAuthField', () => {
    it('toggles a password input between hidden and visible states', () => {
        const field = createAuthField('Password', 'password', 'Choose a password', Eye, 'password');
        const input = field.querySelector('input');
        const toggle = field.querySelector('button');

        expect(input?.type).toBe('password');
        expect(toggle?.getAttribute('aria-label')).toBe('Show password');

        toggle?.click();
        expect(input?.type).toBe('text');
        expect(toggle?.getAttribute('aria-label')).toBe('Hide password');

        toggle?.click();
        expect(input?.type).toBe('password');
        expect(toggle?.getAttribute('aria-label')).toBe('Show password');
    });

    it('associates the label and accessible error element with a required field', () => {
        const field = createAuthField('Email Address', 'email', 'name@example.com', Eye, 'email');
        const input = field.querySelector('input');
        const error = field.querySelector('small');

        expect(input).toMatchObject({
            name: 'email',
            type: 'email',
            required: true,
            placeholder: 'name@example.com',
        });
        expect(field.textContent).toContain('Email Address');
        expect(error?.id).toBe('email-error');
        expect(error?.getAttribute('aria-live')).toBe('polite');
        expect(field.querySelector('button')).toBeNull();
    });
});

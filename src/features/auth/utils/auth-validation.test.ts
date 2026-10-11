import { describe, expect, it } from 'vitest';

import { validateAuthField } from './auth-validation';

describe('validateAuthField', () => {
    it('requires an email value and validates its format', () => {
        expect(validateAuthField('email', 'login', '')).toBe('Email is required.');
        expect(validateAuthField('email', 'login', 'player@example.com')).toBe('');
        expect(validateAuthField('email', 'login', 'not-an-email')).toBe(
            'Enter a valid email address.',
        );
    });

    it('validates login and registration password rules', () => {
        expect(validateAuthField('password', 'login', '')).toBe('Password is required.');
        expect(validateAuthField('password', 'login', 'short')).toBe(
            'Password must be at least 6 characters long.',
        );
        expect(validateAuthField('password', 'register', 'Player1!')).toBe('');
        expect(validateAuthField('password', 'register', 'player1')).toBe(
            'Password must contain at least one uppercase English letter.',
        );
        expect(validateAuthField('password', 'register', 'Player1')).toBe(
            'Password must contain at least one special character.',
        );
    });

    it('checks username and confirm-password rules during registration', () => {
        expect(validateAuthField('username', 'register', 'player')).toBe(
            'Username must start with an uppercase English letter.',
        );
        expect(validateAuthField('username', 'register', 'Player123')).toBe('');
        expect(validateAuthField('confirmPassword', 'register', 'Player1!', 'Player1!')).toBe('');
        expect(validateAuthField('confirmPassword', 'register', 'Player1!', 'Player2!')).toBe(
            'Passwords do not match.',
        );
    });
});

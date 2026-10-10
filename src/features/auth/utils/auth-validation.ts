export type AuthFieldName = 'email' | 'username' | 'password' | 'confirmPassword';
export type AuthValidationMode = 'login' | 'register';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_PATTERN = /^[A-Z][A-Za-z0-9]+$/;
const PASSWORD_CHARS_PATTERN = /^[A-Za-z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]+$/;

function validateEmail(value: string): string {
    const normalizedValue = value.trim();

    if (!normalizedValue) {
        return 'Email is required.';
    }

    return EMAIL_PATTERN.test(normalizedValue) ? '' : 'Enter a valid email address.';
}

function validateUsername(value: string): string {
    if (!value) {
        return 'Username is required.';
    }

    if (value.length < 2 || value.length > 30) {
        return 'Username must be 2-30 characters long.';
    }

    if (!/^[A-Z]/.test(value)) {
        return 'Username must start with an uppercase English letter.';
    }

    return USERNAME_PATTERN.test(value)
        ? ''
        : 'Username may only contain English letters and digits.';
}

function validateLoginPassword(value: string): string {
    if (!value) {
        return 'Password is required.';
    }

    return value.length < 6 ? 'Password must be at least 6 characters long.' : '';
}

function validateRegisterPassword(value: string): string {
    if (!value) {
        return 'Password is required.';
    }

    if (value.length < 6) {
        return 'Password must be at least 6 characters long.';
    }

    if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase English letter.';
    }

    if (!/\d/.test(value)) {
        return 'Password must contain at least one digit.';
    }

    if (!/[^A-Za-z0-9]/.test(value)) {
        return 'Password must contain at least one special character.';
    }

    return PASSWORD_CHARS_PATTERN.test(value) ? '' : 'Password contains unsupported characters.';
}

function validateConfirmPassword(value: string, passwordValue: string): string {
    if (!value) {
        return 'Please confirm your password.';
    }

    return value === passwordValue ? '' : 'Passwords do not match.';
}

export function validateAuthField(
    fieldName: AuthFieldName,
    mode: AuthValidationMode,
    value: string,
    passwordValue = '',
): string {
    if (fieldName === 'email') {
        return validateEmail(value);
    }

    if (mode === 'login' && fieldName === 'password') {
        return validateLoginPassword(value);
    }

    if (mode === 'register' && fieldName === 'username') {
        return validateUsername(value);
    }

    if (mode === 'register' && fieldName === 'password') {
        return validateRegisterPassword(value);
    }

    return mode === 'register' && fieldName === 'confirmPassword'
        ? validateConfirmPassword(value, passwordValue)
        : '';
}

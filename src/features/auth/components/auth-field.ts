import { Eye, createElement } from 'lucide';
import { createIconButton } from '@/shared/components';
import type { AuthFieldName } from '../utils/auth-validation';

type IconNode = Parameters<typeof createElement>[0];

export function createAuthField(
    labelText: string,
    inputType: string,
    placeholder: string,
    icon: IconNode,
    fieldName: AuthFieldName,
): HTMLLabelElement {
    const field = document.createElement('label');
    field.classList.add('auth-field');

    const label = document.createElement('span');
    label.className = 'auth-field-label';
    label.textContent = labelText;

    const inputWrapper = document.createElement('span');
    inputWrapper.className = 'auth-field-control';
    inputWrapper.append(createElement(icon));

    const input = document.createElement('input');
    input.type = inputType;
    input.name = fieldName;
    input.placeholder = placeholder;
    input.required = true;
    input.dataset.authField = fieldName;
    inputWrapper.append(input);

    if (inputType === 'password') {
        const visibilityButton = createIconButton('Show password', Eye, {
            size: 'sm',
            shape: 'square',
        });
        visibilityButton.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
            visibilityButton.setAttribute(
                'aria-label',
                input.type === 'password' ? 'Show password' : 'Hide password',
            );
        });
        inputWrapper.append(visibilityButton);
    }

    const error = document.createElement('small');
    error.className = 'auth-field-error';
    error.id = `${fieldName}-error`;
    error.setAttribute('aria-live', 'polite');
    error.hidden = true;

    field.append(label, inputWrapper, error);
    return field;
}

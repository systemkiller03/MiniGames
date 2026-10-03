import './button.scss';

export type ButtonVariant = 'primary' | 'outline' | 'outline-inverse';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonOptions {
    label?: string;
    icon?: Node;
    iconLeft?: Node;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
    shadow?: boolean;
    disabled?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export function createButton({
    label,
    icon,
    iconLeft,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    shadow = false,
    disabled = false,
    type = 'button',
}: ButtonOptions): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = type;
    button.className = 'btn';
    button.dataset.variant = variant;
    button.dataset.size = size;
    button.disabled = disabled;

    if (fullWidth) {
        button.dataset.fullWidth = '';
    }
    if (shadow && size === 'lg') {
        button.dataset.shadow = '';
    }
    if (iconLeft) {
        button.append(iconLeft);
    }
    if (label) {
        button.append(document.createTextNode(label));
    }
    if (icon) {
        button.append(icon);
    }

    return button;
}

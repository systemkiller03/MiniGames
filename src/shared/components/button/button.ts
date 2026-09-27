import './button.scss';

export type ButtonVariant = 'primary' | 'outline';

export function createButton({
    label,
    icon,
    variant = 'primary',
}: {
    label?: string;
    icon?: Node;
    variant: ButtonVariant;
}): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `btn btn--${variant}`;
    if (label) {
        button.textContent = label;
    }
    if (icon) {
        button.appendChild(icon);
    }

    return button;
}

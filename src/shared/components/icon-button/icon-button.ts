import './icon-button.scss';
import { createElement } from 'lucide';

type IconNode = Parameters<typeof createElement>[0];

export type IconButtonSize = 'sm' | 'md';
export type IconButtonShape = 'square' | 'circle';
export type IconButtonTone = 'light' | 'dark';
export type IconButtonVariant = 'plain' | 'surface' | 'primary';

export interface IconButtonOptions {
    size?: IconButtonSize;
    shape?: IconButtonShape;
    tone?: IconButtonTone;
    variant?: IconButtonVariant;
    disabled?: boolean;
}

export function createIconButton(
    label: string,
    icon: string | IconNode,
    {
        size = 'md',
        shape = 'square',
        tone = 'light',
        variant = 'plain',
        disabled = false,
    }: IconButtonOptions = {},
): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'icon-button';
    button.dataset.size = size;
    button.dataset.shape = shape;
    button.dataset.tone = tone;
    button.dataset.variant = variant;
    button.disabled = disabled;
    button.setAttribute('aria-label', label);

    if (typeof icon === 'string') {
        button.textContent = icon;
    } else {
        button.append(createElement(icon));
    }
    return button;
}

import './toggle-button.scss';
import { createElement, Heart } from 'lucide';

type PressedOption = { [key in 'pressed']?: boolean };

export interface ToggleButtonOptions extends PressedOption {
    iconOnly?: boolean;
    labelOff?: string;
    labelOn?: string;
    onToggle?: (isPressed: boolean) => void;
    compact?: boolean;
    count?: number;
    disabled?: boolean;
}

export function createToggleButton({
    pressed = false,
    iconOnly = false,
    labelOff = 'Add to Favorites',
    labelOn = 'Remove from Favorites',
    onToggle,
    compact = false,
    count,
    disabled = false,
}: ToggleButtonOptions = {}): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'toggle-button';
    button.dataset.iconOnly = String(iconOnly);
    button.dataset.compact = String(compact);
    button.disabled = disabled;
    button.setAttribute('aria-pressed', String(pressed));

    const icon = createElement(Heart);
    icon.setAttribute('aria-hidden', 'true');
    const label = document.createElement('span');
    const countLabel = count === undefined ? undefined : document.createElement('span');

    const update = (): void => {
        button.dataset.pressed = String(pressed);
        const labelText = pressed ? labelOn : labelOff;
        button.setAttribute(
            'aria-label',
            count === undefined ? labelText : `${labelText}, ${count} likes`,
        );
        button.replaceChildren(icon);
        if (!iconOnly) {
            label.textContent = pressed ? labelOn : labelOff;
            button.append(label);
        }
        if (!countLabel) {
            return;
        }

        countLabel.textContent = String(count);
        button.append(countLabel);
    };

    button.addEventListener('click', () => {
        pressed = !pressed;
        button.setAttribute('aria-pressed', String(pressed));
        update();
        onToggle?.(pressed);
    });

    update();
    return button;
}

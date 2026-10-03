import './filter-chip.scss';

export interface FilterChipOptions {
    selected?: boolean;
    children: string | Node;
    onClick?: () => void;
    disabled?: boolean;
}

export function createFilterChip({
    selected = false,
    children,
    onClick,
    disabled = false,
}: FilterChipOptions): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'filter-chip';
    button.disabled = disabled;
    if (children instanceof Node) {
        button.append(children);
    } else {
        button.textContent = children;
    }
    button.setAttribute('aria-pressed', String(selected));
    button.addEventListener('click', () => onClick?.());
    return button;
}

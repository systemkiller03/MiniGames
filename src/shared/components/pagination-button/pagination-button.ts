import './pagination-button.scss';
import { ChevronLeft, ChevronRight, createElement } from 'lucide';

export type PaginationButtonKind = 'page' | 'prev' | 'next';

export interface PaginationButtonOptions {
    kind: PaginationButtonKind;
    selected?: boolean;
    disabled?: boolean;
    children?: string | Node;
}

export function createPaginationButton({
    kind,
    selected = false,
    disabled = false,
    children,
}: PaginationButtonOptions): HTMLButtonElement;
export function createPaginationButton(number: number): HTMLButtonElement;
export function createPaginationButton(
    options: PaginationButtonOptions | number,
): HTMLButtonElement {
    const normalized =
        typeof options === 'number'
            ? { kind: 'page' as const, children: String(options) }
            : options;
    const { kind, selected = false, disabled = false, children } = normalized;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'pagination-button';
    button.dataset.kind = kind;
    button.disabled = disabled;

    if (kind === 'prev' || kind === 'next') {
        const icon = createElement(kind === 'prev' ? ChevronLeft : ChevronRight);
        icon.setAttribute('aria-hidden', 'true');
        button.append(icon);
        button.setAttribute('aria-label', kind === 'prev' ? 'Previous page' : 'Next page');
    } else if (children instanceof Node) {
        button.append(children);
    } else if (children !== undefined) {
        button.textContent = children;
        button.setAttribute('aria-label', `Page ${children}`);
    }

    if (selected) {
        button.setAttribute('aria-current', 'page');
    }
    return button;
}

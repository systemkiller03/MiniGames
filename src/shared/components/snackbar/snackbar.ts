import './snackbar.scss';
import { X, createElement } from 'lucide';

export type SnackbarVariant = 'success' | 'error';

export interface SnackbarControl {
    element: HTMLDivElement;
    show(message: string, variant: SnackbarVariant): void;
    hide(): void;
}

export function createSnackbar(): SnackbarControl {
    const element = document.createElement('div');
    element.className = 'snackbar';
    element.setAttribute('role', 'status');
    element.setAttribute('aria-live', 'polite');
    element.setAttribute('aria-atomic', 'true');

    const messageElement = document.createElement('span');
    messageElement.className = 'snackbar_message';

    const closeButton = document.createElement('button');
    closeButton.className = 'snackbar_close';
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Close notification');
    closeButton.append(createElement(X));
    closeButton.disabled = true;
    closeButton.addEventListener('click', hide);
    element.append(messageElement, closeButton);

    let timer: number | undefined;

    function hide(): void {
        if (timer !== undefined) {
            globalThis.clearTimeout(timer);
            timer = undefined;
        }
        element.classList.remove('is-visible');
        closeButton.disabled = true;
    }

    function show(message: string, variant: SnackbarVariant): void {
        if (timer !== undefined) {
            globalThis.clearTimeout(timer);
        }

        messageElement.textContent = message;
        element.dataset.variant = variant;
        element.setAttribute('role', variant === 'error' ? 'alert' : 'status');
        element.setAttribute('aria-live', variant === 'error' ? 'assertive' : 'polite');
        closeButton.disabled = false;
        element.classList.add('is-visible');
        timer = globalThis.setTimeout(hide, 3200);
    }

    return { element, show, hide };
}

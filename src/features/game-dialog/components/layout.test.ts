import { describe, expect, it, vi } from 'vitest';

import { createGameDialogLayout } from './layout';

describe('createGameDialogLayout', () => {
    it('replaces dialog content and calls close behavior only for the close button or backdrop', () => {
        const onClose = vi.fn();
        const layout = createGameDialogLayout(onClose);
        const heading = document.createElement('h2');
        heading.textContent = 'Details';
        layout.setContent(heading);
        expect(layout.content.firstElementChild).toBe(heading);

        const panel = layout.dialog.firstElementChild;
        panel?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(onClose).not.toHaveBeenCalled();
        layout.dialog.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
        expect(onClose).toHaveBeenCalledOnce();

        const another = createGameDialogLayout(onClose);
        another.dialog.querySelector<HTMLButtonElement>('button')?.click();
        expect(onClose).toHaveBeenCalledTimes(2);
    });
});

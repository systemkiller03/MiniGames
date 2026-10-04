import { createIconButton } from '@/shared/components';
import { X } from 'lucide';

export type GameDialogLayout = {
    dialog: HTMLDialogElement;
    image: HTMLImageElement;
    content: HTMLElement;
    setContent: (...children: HTMLElement[]) => void;
};

export function createGameDialogLayout(onClose?: () => void): GameDialogLayout {
    const dialog = document.createElement('dialog');
    dialog.className = 'game-dialog';
    dialog.setAttribute('aria-labelledby', 'game-dialog-title');
    dialog.setAttribute('aria-describedby', 'game-dialog-description');

    const panel = document.createElement('div');
    const closeButton = createIconButton('Close dialog', X, {
        size: 'md',
        shape: 'square',
        tone: 'dark',
    });
    closeButton.addEventListener('click', () => {
        dialog.close();
        onClose?.();
    });

    const media = document.createElement('figure');
    const image = document.createElement('img');
    image.alt = 'Game cover';
    media.append(image);

    const content = document.createElement('main');
    const setContent = (...children: HTMLElement[]): void => {
        content.replaceChildren(...children);
    };

    panel.append(closeButton, media, content);
    dialog.append(panel);
    dialog.addEventListener('click', (event) => {
        if (event.target !== dialog) {
            return;
        }

        dialog.close();
        onClose?.();
    });

    return { dialog, image, content, setContent };
}

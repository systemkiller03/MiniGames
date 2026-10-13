import { beforeEach, vi } from 'vitest';

beforeEach(() => {
    Object.defineProperty(globalThis, 'matchMedia', {
        configurable: true,
        writable: true,
        value: vi.fn((media: string) => ({
            matches: false,
            media,
            onchange: undefined,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(() => false),
        })),
    });
    const dialogPrototype = globalThis.HTMLDialogElement.prototype;
    if (typeof dialogPrototype.showModal !== 'function') {
        Object.defineProperty(dialogPrototype, 'showModal', {
            configurable: true,
            value(this: HTMLDialogElement) {
                this.setAttribute('open', '');
            },
        });
    }
    if (typeof dialogPrototype.close !== 'function') {
        Object.defineProperty(dialogPrototype, 'close', {
            configurable: true,
            value(this: HTMLDialogElement) {
                this.removeAttribute('open');
                this.dispatchEvent(new Event('close'));
            },
        });
    }
});

import '../styles/sort-dropdown.scss';
import { ChevronDown, createElement } from 'lucide';

export type LibrarySortKey = 'rating-desc' | 'rating-asc' | 'name-asc' | 'name-desc';

const SORT_OPTIONS: { key: LibrarySortKey; label: string }[] = [
    { key: 'rating-desc', label: 'Rating ↓' },
    { key: 'rating-asc', label: 'Rating ↑' },
    { key: 'name-asc', label: 'Name A–Z' },
    { key: 'name-desc', label: 'Name Z–A' },
];

export function createSortDropdown(onSort: (sortKey: LibrarySortKey) => void): HTMLElement {
    const dropdown = document.createElement('div');
    dropdown.className = 'sort-dropdown';

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'sort-dropdown__trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const triggerLabel = document.createElement('span');
    const chevron = createElement(ChevronDown);
    chevron.setAttribute('aria-hidden', 'true');
    trigger.append(triggerLabel, chevron);

    const menu = document.createElement('div');
    menu.className = 'sort-dropdown__menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('aria-label', 'Sort options');
    menu.hidden = true;

    const options = SORT_OPTIONS.map(({ key, label }) => {
        const option = document.createElement('div');
        option.className = 'sort-dropdown__item';
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        option.tabIndex = -1;
        option.dataset.sortKey = key;
        option.textContent = label;
        menu.append(option);
        return { key, option, label };
    });

    let selectedKey: LibrarySortKey = 'rating-desc';

    const updateSelection = (key: LibrarySortKey): void => {
        selectedKey = key;
        const selected = options.find((item) => item.key === key);
        if (!selected) return;

        triggerLabel.textContent = `Sort by: ${selected.label}`;
        for (const item of options) {
            item.option.setAttribute('aria-selected', String(item.key === key));
        }
    };

    const close = (shouldReturnFocus = false): void => {
        menu.hidden = true;
        trigger.setAttribute('aria-expanded', 'false');
        if (shouldReturnFocus) trigger.focus();
    };

    const open = (focusIndex?: number): void => {
        menu.hidden = false;
        trigger.setAttribute('aria-expanded', 'true');
        if (focusIndex !== undefined) options[focusIndex]?.option.focus();
    };

    const select = (key: LibrarySortKey): void => {
        updateSelection(key);
        close(true);
        onSort(key);
    };

    trigger.addEventListener('click', () => {
        if (menu.hidden) {
            open();
        } else {
            close();
        }
    });

    trigger.addEventListener('keydown', (event: KeyboardEvent) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault();
            open(0);
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            open(options.length - 1);
        } else if (event.key === 'Escape' && !menu.hidden) {
            close(true);
        }
    });

    for (const [index, item] of options.entries()) {
        item.option.addEventListener('click', () => select(item.key));
        item.option.addEventListener('keydown', (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                close(true);
                return;
            }

            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const direction = event.key === 'ArrowDown' ? 1 : -1;
                const nextIndex = (index + direction + options.length) % options.length;
                options[nextIndex]?.option.focus();
            } else if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                select(item.key);
            }
        });
    }

    document.addEventListener('pointerdown', (event: PointerEvent) => {
        if (event.target instanceof Node && !dropdown.contains(event.target)) {
            close();
        }
    });

    updateSelection(selectedKey);
    dropdown.append(trigger, menu);
    return dropdown;
}

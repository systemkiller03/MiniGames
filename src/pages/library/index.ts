import { createDescription } from '@/features/description/description';
import { createLibrary } from '@/features/library';

export function createLibraryPage(): HTMLElement {
    const main = document.createElement('main');
    main.append(
        createDescription('Game Library', 'Browse our collection of casual mini-games'),
        createLibrary(),
    );
    return main;
}

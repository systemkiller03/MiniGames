import { createDescription } from '@/features/description/description';
import { createLibrary } from '@/features/library';

export function createLibraryPage(): HTMLElement {
    const page = document.createElement('div');
    page.append(
        createDescription('Game Library', 'Browse our collection of casual mini-games'),
        createLibrary(),
    );
    return page;
}

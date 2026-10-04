import { createFooter } from '@/features/footer/footer';
import { createHeader } from '@/features/header/header';

export function createApp() {
    const body = document.body;
    body.append(createHeader());
    const main = document.createElement('main');
    body.append(main);
    body.append(createFooter());

    return main;
}

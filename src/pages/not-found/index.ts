import { getNavigationUrl } from '@/shared/utils/navigation';
import '../page-states.scss';

export function createNotFoundPage(): HTMLElement {
    const page = document.createElement('section');
    page.className = 'not-found-page';
    page.setAttribute('aria-labelledby', 'not-found-title');

    const errorCode = document.createElement('p');
    errorCode.className = 'not-found-code';
    errorCode.textContent = '404';
    errorCode.setAttribute('aria-hidden', 'true');

    const title = document.createElement('h1');
    title.id = 'not-found-title';
    title.textContent = 'Page not found';

    const message = document.createElement('p');
    message.textContent = 'The requested URL does not exist. It may have been moved or deleted.';

    const homeLink = document.createElement('a');
    homeLink.className = 'not-found-home-link';
    homeLink.href = getNavigationUrl('/');
    homeLink.textContent = 'Return to Home Page';

    page.append(errorCode, title, message, homeLink);
    return page;
}

import './page-states.scss';

export function createPageLoading(): HTMLElement {
    const loading = document.createElement('section');
    loading.className = 'page-loading';
    loading.dataset.state = 'loading';
    loading.setAttribute('role', 'status');
    loading.setAttribute('aria-live', 'polite');
    loading.setAttribute('aria-busy', 'true');

    const spinner = document.createElement('span');
    spinner.className = 'page-loading-spinner';
    spinner.setAttribute('aria-hidden', 'true');

    const message = document.createElement('p');
    message.textContent = 'Loading page...';

    loading.append(spinner, message);
    return loading;
}

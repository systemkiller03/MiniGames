import { describe, expect, it } from 'vitest';

import { createPageLoading } from './loading';

describe('createPageLoading', () => {
    it('announces pending page navigation to assistive technology', () => {
        const loading = createPageLoading();

        expect(loading.dataset.state).toBe('loading');
        expect(loading.getAttribute('role')).toBe('status');
        expect(loading.getAttribute('aria-busy')).toBe('true');
        expect(loading.textContent).toContain('Loading page...');
    });
});

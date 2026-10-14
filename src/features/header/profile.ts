import type { AppSession } from '@/features/auth/api/auth.api';
import { createButton } from '@/shared/components';

function getProfileDisplayName(session?: Pick<AppSession, 'displayName' | 'email'>): string {
    const displayName = session?.displayName?.trim() ?? '';
    if (displayName) {
        return displayName;
    }

    const emailLocalPart = session?.email?.split('@', 2)[0]?.trim() ?? '';
    return emailLocalPart || 'Player';
}

function getProfileInitials(name: string): string {
    const trimmedName = name.trim();
    if (!trimmedName) {
        return 'P';
    }

    const initials: string[] = [];
    const words = trimmedName.split(/\s+/u).filter(Boolean);
    for (const word of words.slice(0, 2)) {
        const match = word.match(/[\p{L}\p{N}]/u);
        if (match) {
            initials.push(match[0].toUpperCase());
        }
        if (initials.length === 2) {
            break;
        }
    }

    return initials.join('') || 'P';
}

export function createProfileState(session?: AppSession): HTMLElement {
    const profile = document.createElement('div');
    profile.className = 'profile-state';

    const displayName = getProfileDisplayName(session);
    const initials = getProfileInitials(displayName);

    const avatar = document.createElement('div');
    avatar.className = 'profile-state__avatar';
    avatar.setAttribute('aria-label', `${displayName} profile avatar`);

    const avatarImage = document.createElement('img');
    avatarImage.alt = `${displayName} profile photo`;
    avatarImage.loading = 'lazy';
    avatarImage.decoding = 'async';

    const fallback = document.createElement('span');
    fallback.className = 'profile-state__fallback';
    fallback.textContent = initials;

    if (session?.avatarUrl) {
        avatarImage.src = session.avatarUrl;
        avatarImage.addEventListener('error', () => {
            avatarImage.hidden = true;
            fallback.hidden = false;
        });
        avatarImage.addEventListener('load', () => {
            fallback.hidden = true;
            avatarImage.hidden = false;
        });
    } else {
        avatarImage.hidden = true;
        fallback.hidden = false;
    }

    avatar.append(avatarImage, fallback);

    const name = document.createElement('span');
    name.className = 'profile-state__name';
    name.textContent = displayName;

    const logout = createButton({ label: 'Log Out', variant: 'outline', size: 'sm' });
    logout.dataset.authAction = 'logout';

    profile.append(avatar, name, logout);
    return profile;
}

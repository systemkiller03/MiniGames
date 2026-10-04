import './auth.scss';
import { Eye, LockKeyhole, Mail, UserRound, X, createElement } from 'lucide';
import { createButton, createIconButton } from '@/shared/components';

type IconNode = Parameters<typeof createElement>[0];
export type AuthMode = 'login' | 'register';

function createAuthField(
    labelText: string,
    inputType: string,
    placeholder: string,
    icon: IconNode,
): HTMLLabelElement {
    const field = document.createElement('label');

    const label = document.createElement('span');
    label.textContent = labelText;

    const inputWrapper = document.createElement('span');
    inputWrapper.append(createElement(icon));

    const input = document.createElement('input');
    input.type = inputType;
    input.placeholder = placeholder;
    input.required = true;
    inputWrapper.append(input);

    if (inputType === 'password') {
        const visibilityButton = createIconButton('Show password', Eye, {
            size: 'sm',
            shape: 'square',
        });
        visibilityButton.addEventListener('click', () => {
            input.type = input.type === 'password' ? 'text' : 'password';
            visibilityButton.setAttribute(
                'aria-label',
                input.type === 'password' ? 'Show password' : 'Hide password',
            );
        });
        inputWrapper.append(visibilityButton);
    }

    field.append(label, inputWrapper);
    return field;
}

export function createAuthDialog(onModeChange?: (mode: AuthMode) => void): {
    dialog: HTMLDialogElement;
    setMode: (mode: AuthMode) => void;
} {
    const dialog = document.createElement('dialog');
    dialog.className = 'auth-dialog';
    dialog.setAttribute('aria-labelledby', 'auth-dialog-title');

    const close = createIconButton('Close dialog', X, {
        size: 'sm',
        shape: 'square',
    });
    const tabs = document.createElement('div');
    tabs.setAttribute('role', 'tablist');
    tabs.setAttribute('aria-label', 'Authentication mode');
    const loginTab = createButton({ label: 'Login', variant: 'outline', size: 'md' });
    loginTab.classList.add('auth-tab');
    loginTab.setAttribute('role', 'tab');
    loginTab.setAttribute('aria-controls', 'auth-dialog-form');
    const registerTab = createButton({ label: 'Register', variant: 'outline', size: 'md' });
    registerTab.classList.add('auth-tab');
    registerTab.setAttribute('role', 'tab');
    registerTab.setAttribute('aria-controls', 'auth-dialog-form');
    tabs.append(loginTab, registerTab);

    const title = document.createElement('h2');
    title.id = 'auth-dialog-title';
    const message = document.createElement('p');

    const form = document.createElement('form');
    form.id = 'auth-dialog-form';
    form.addEventListener('submit', (event) => event.preventDefault());

    const fields = document.createElement('div');

    const forgotPassword = createButton({
        label: 'Forgot Password?',
        variant: 'outline',
        size: 'sm',
    });
    forgotPassword.classList.add('auth-text-button');

    const submit = createButton({
        variant: 'primary',
        size: 'lg',
        fullWidth: true,
        type: 'submit',
    });

    const divider = document.createElement('div');
    divider.append(document.createElement('span'));
    const dividerLabel = document.createElement('span');
    dividerLabel.textContent = 'OR';
    divider.append(dividerLabel, document.createElement('span'));

    const googleLabel = document.createElement('span');
    googleLabel.textContent = 'G';
    const google = createButton({
        variant: 'outline',
        size: 'lg',
        fullWidth: true,
        iconLeft: googleLabel,
    });
    google.type = 'button';
    google.append(document.createTextNode('Continue with Google'));

    const footer = document.createElement('p');

    let currentMode: AuthMode = 'login';

    const setMode = (mode: AuthMode): void => {
        currentMode = mode;
        const isLogin = mode === 'login';
        loginTab.setAttribute('aria-selected', String(isLogin));
        registerTab.setAttribute('aria-selected', String(!isLogin));
        loginTab.tabIndex = isLogin ? 0 : -1;
        registerTab.tabIndex = isLogin ? -1 : 0;
        title.textContent = isLogin ? 'Welcome Back!' : 'Create Account';
        message.textContent = isLogin
            ? 'Sign in to resume your games and progress.'
            : 'Join MiniGames to track your score & streak.';
        fields.replaceChildren(
            ...(isLogin
                ? [
                      createAuthField('Email Address', 'email', 'e.g. alex@minigames.com', Mail),
                      createAuthField('Password', 'password', '••••••••', LockKeyhole),
                  ]
                : [
                      createAuthField('Username', 'text', 'e.g. CozyGamer_99', UserRound),
                      createAuthField('Email Address', 'email', 'your.email@domain.com', Mail),
                      createAuthField('Password', 'password', 'Min. 8 characters', LockKeyhole),
                      createAuthField(
                          'Confirm Password',
                          'password',
                          'Repeat your password',
                          LockKeyhole,
                      ),
                  ]),
        );
        forgotPassword.hidden = !isLogin;
        submit.textContent = isLogin ? 'Login' : 'Create Account';
        footer.textContent = isLogin ? "Don't have an account? " : 'Already have an account? ';
        const footerAction = createButton({
            label: isLogin ? 'Register' : 'Login',
            variant: 'outline',
            size: 'sm',
        });
        footerAction.classList.add('auth-text-button');
        footerAction.addEventListener('click', () => selectMode(isLogin ? 'register' : 'login'));
        footer.append(footerAction);
    };

    const selectMode = (mode: AuthMode): void => {
        if (mode === currentMode) {
            return;
        }

        setMode(mode);
        onModeChange?.(mode);
    };

    close.addEventListener('click', () => dialog.close());
    loginTab.addEventListener('click', () => selectMode('login'));
    registerTab.addEventListener('click', () => selectMode('register'));
    loginTab.setAttribute('aria-label', 'Show login form');
    registerTab.setAttribute('aria-label', 'Show registration form');
    dialog.append(close, tabs, title, message, form);
    form.append(fields, forgotPassword, submit, divider, google, footer);
    setMode('login');
    return { dialog, setMode };
}

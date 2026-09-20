import './auth.scss'
import { Eye, LockKeyhole, Mail, UserRound, X, createElement } from 'lucide'

type IconNode = Parameters<typeof createElement>[0]
export type AuthMode = 'login' | 'register'

function createIconButton(label: string, icon: IconNode, className: string): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = className
  button.setAttribute('aria-label', label)
  button.append(createElement(icon))
  return button
}

function createAuthField(
  labelText: string,
  inputType: string,
  placeholder: string,
  icon: IconNode,
): HTMLLabelElement {
  const field = document.createElement('label')
  field.className = 'auth-dialog__field'

  const label = document.createElement('span')
  label.className = 'auth-dialog__label'
  label.textContent = labelText

  const inputWrapper = document.createElement('span')
  inputWrapper.className = 'auth-dialog__input-wrapper'
  inputWrapper.append(createElement(icon))

  const input = document.createElement('input')
  input.type = inputType
  input.placeholder = placeholder
  input.required = true
  inputWrapper.append(input)

  if (inputType === 'password') {
    const visibilityButton = createIconButton('Show password', Eye, 'auth-dialog__visibility')
    visibilityButton.addEventListener('click', () => {
      input.type = input.type === 'password' ? 'text' : 'password'
      visibilityButton.setAttribute(
        'aria-label',
        input.type === 'password' ? 'Show password' : 'Hide password',
      )
    })
    inputWrapper.append(visibilityButton)
  }

  field.append(label, inputWrapper)
  return field
}

export function createAuthDialog(): {
  dialog: HTMLDialogElement
  setMode: (mode: AuthMode) => void
} {
  const dialog = document.createElement('dialog')
  dialog.className = 'auth-dialog'
  dialog.setAttribute('aria-labelledby', 'auth-dialog-title')

  const close = createIconButton('Close dialog', X, 'auth-dialog__close')
  const tabs = document.createElement('div')
  tabs.className = 'auth-dialog__tabs'
  tabs.setAttribute('role', 'tablist')
  tabs.setAttribute('aria-label', 'Authentication mode')
  const loginTab = document.createElement('button')
  loginTab.type = 'button'
  loginTab.className = 'auth-dialog__tab'
  loginTab.setAttribute('role', 'tab')
  loginTab.setAttribute('aria-controls', 'auth-dialog-form')
  loginTab.textContent = 'Login'
  const registerTab = document.createElement('button')
  registerTab.type = 'button'
  registerTab.className = 'auth-dialog__tab'
  registerTab.setAttribute('role', 'tab')
  registerTab.setAttribute('aria-controls', 'auth-dialog-form')
  registerTab.textContent = 'Register'
  tabs.append(loginTab, registerTab)

  const title = document.createElement('h2')
  title.id = 'auth-dialog-title'
  const message = document.createElement('p')
  message.className = 'auth-dialog__message'

  const form = document.createElement('form')
  form.className = 'auth-dialog__form'
  form.id = 'auth-dialog-form'
  form.addEventListener('submit', (event) => event.preventDefault())

  const fields = document.createElement('div')
  fields.className = 'auth-dialog__fields'

  const forgotPassword = document.createElement('button')
  forgotPassword.type = 'button'
  forgotPassword.className = 'auth-dialog__forgot'
  forgotPassword.textContent = 'Forgot Password?'

  const submit = document.createElement('button')
  submit.type = 'submit'
  submit.className = 'auth-dialog__submit'

  const divider = document.createElement('div')
  divider.className = 'auth-dialog__divider'
  divider.append(document.createElement('span'))
  const dividerLabel = document.createElement('span')
  dividerLabel.textContent = 'OR'
  divider.append(dividerLabel, document.createElement('span'))

  const google = document.createElement('button')
  google.type = 'button'
  google.className = 'auth-dialog__google'
  google.textContent = 'G  Continue with Google'

  const footer = document.createElement('p')
  footer.className = 'auth-dialog__footer'

  const setMode = (mode: AuthMode): void => {
    const isLogin = mode === 'login'
    loginTab.classList.toggle('is-active', isLogin)
    registerTab.classList.toggle('is-active', !isLogin)
    loginTab.setAttribute('aria-selected', String(isLogin))
    registerTab.setAttribute('aria-selected', String(!isLogin))
    loginTab.tabIndex = isLogin ? 0 : -1
    registerTab.tabIndex = isLogin ? -1 : 0
    title.textContent = isLogin ? 'Welcome Back!' : 'Create Account'
    message.textContent = isLogin
      ? 'Sign in to resume your games and progress.'
      : 'Join MiniGames to track your score & streak.'
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
            createAuthField('Confirm Password', 'password', 'Repeat your password', LockKeyhole),
          ]),
    )
    forgotPassword.hidden = !isLogin
    submit.textContent = isLogin ? 'Login' : 'Create Account'
    footer.textContent = isLogin ? "Don't have an account? " : 'Already have an account? '
    const footerAction = document.createElement('button')
    footerAction.type = 'button'
    footerAction.className = 'auth-dialog__footer-action'
    footerAction.textContent = isLogin ? 'Register' : 'Login'
    footerAction.addEventListener('click', () => setMode(isLogin ? 'register' : 'login'))
    footer.append(footerAction)
  }

  close.addEventListener('click', () => dialog.close())
  loginTab.addEventListener('click', () => setMode('login'))
  registerTab.addEventListener('click', () => setMode('register'))
  loginTab.setAttribute('aria-label', 'Show login form')
  registerTab.setAttribute('aria-label', 'Show registration form')
  dialog.append(close, tabs, title, message, form)
  form.append(fields, forgotPassword, submit, divider, google, footer)
  setMode('login')
  return { dialog, setMode }
}

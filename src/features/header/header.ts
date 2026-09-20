import './header.scss'
import logoSource from '../../assets/Logo.svg'
import { createButton } from '../../shared/components/button/button'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Library', href: '/library' },
  { label: 'Tournaments', href: '/tournaments' },
  { label: 'Community', href: '/community' },
]

function createLink(label: string, href: string, className = ''): HTMLAnchorElement {
  const link = document.createElement('a')
  link.href = href
  link.textContent = label
  if (className) link.className = className
  return link
}

function createIconButton(label: string, icon: string, className: string): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = className
  button.setAttribute('aria-label', label)
  button.textContent = icon
  return button
}

function createAuthDialog(): HTMLDialogElement {
  const dialog = document.createElement('dialog')
  dialog.className = 'auth-dialog'
  dialog.setAttribute('aria-labelledby', 'auth-dialog-title')

  const close = createIconButton('Close dialog', '×', 'auth-dialog__close')
  const title = document.createElement('h2')
  title.id = 'auth-dialog-title'
  title.textContent = 'Welcome to MiniGames'
  const message = document.createElement('p')
  message.textContent = 'Log in or create an account to continue.'

  close.addEventListener('click', () => dialog.close())
  dialog.append(close, title, message)
  return dialog
}

export function createHeader(currentPath = '/'): HTMLElement {
  const header = document.createElement('header')
  header.className = 'header'

  const brand = document.createElement('a')
  brand.className = 'header__brand'
  brand.href = '/'

  const logo = document.createElement('img')
  logo.className = 'header__logo'
  logo.src = logoSource
  logo.alt = 'MiniGames logo'

  const brandName = document.createElement('span')
  brandName.className = 'header__brand-name'
  brandName.textContent = 'MiniGames'
  brand.append(logo, brandName)

  const menuToggle = createIconButton('Open navigation menu', '☰', 'header__menu-toggle')

  const nav = document.createElement('nav')
  nav.className = 'header__nav'
  nav.setAttribute('aria-label', 'Main')

  const list = document.createElement('ul')
  list.className = 'header__list'

  for (const { label, href } of NAV_LINKS) {
    const item = document.createElement('li')
    const link = createLink(label, href, 'header__link')
    if (href === currentPath) link.setAttribute('aria-current', 'page')
    item.append(link)
    list.append(item)
  }

  const logIn = createLink('Log In', '/login', 'btn btn--outline header__login')
  const signUp = createLink('Sign Up', '/register', 'btn btn--primary header__sign-up')

  nav.append(list, logIn, signUp)

  const mobileMenu = document.createElement('div')
  mobileMenu.className = 'mobile-menu'
  mobileMenu.setAttribute('aria-hidden', 'true')

  const mobileMenuHeader = document.createElement('div')
  mobileMenuHeader.className = 'mobile-menu__header'
  const mobileClose = createIconButton('Close navigation menu', '×', 'mobile-menu__close')
  mobileMenuHeader.append(brand.cloneNode(true), mobileClose)

  const mobileNav = document.createElement('nav')
  mobileNav.className = 'mobile-menu__nav'
  mobileNav.setAttribute('aria-label', 'Mobile main')
  for (const { label, href } of NAV_LINKS) {
    const link = createLink(label, href, 'mobile-menu__link')
    if (href === currentPath) link.setAttribute('aria-current', 'page')
    mobileNav.append(link)
  }

  const mobileActions = document.createElement('div')
  mobileActions.className = 'mobile-menu__actions'
  const mobileLogIn = createButton('Log In', 'outline')
  const mobileSignUp = createButton('Sign Up', 'primary')
  mobileActions.append(mobileLogIn, mobileSignUp)

  const authDialog = createAuthDialog()
  const openMenu = (): void => {
    mobileMenu.classList.add('is-open')
    mobileMenu.setAttribute('aria-hidden', 'false')
    menuToggle.setAttribute('aria-expanded', 'true')
    document.body.classList.add('mobile-menu-open')
  }
  const closeMenu = (): void => {
    mobileMenu.classList.remove('is-open')
    mobileMenu.setAttribute('aria-hidden', 'true')
    menuToggle.setAttribute('aria-expanded', 'false')
    document.body.classList.remove('mobile-menu-open')
  }
  const openAuthDialog = (): void => authDialog.showModal()

  menuToggle.setAttribute('aria-expanded', 'false')
  menuToggle.addEventListener('click', openMenu)
  mobileClose.addEventListener('click', closeMenu)
  mobileLogIn.addEventListener('click', openAuthDialog)
  mobileSignUp.addEventListener('click', openAuthDialog)
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('is-open') && !authDialog.open) {
      closeMenu()
    }
  })

  mobileMenu.append(mobileMenuHeader, mobileNav, mobileActions)
  header.append(brand, menuToggle, nav, mobileMenu, authDialog)
  return header
}

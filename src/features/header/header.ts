import './header.scss'
import { Menu, X, createElement } from 'lucide'
import logoSource from '../../assets/Logo.svg'
import { createButton } from '../../shared/components/button/button'
import { createAuthDialog, type AuthMode } from '../auth/auth'

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

type IconNode = Parameters<typeof createElement>[0]

function createIconButton(
  label: string,
  icon: string | IconNode,
  className: string,
): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = className
  button.setAttribute('aria-label', label)

  const glyph = document.createElement('span')
  glyph.className = 'icon-button__glyph'

  if (typeof icon === 'string') {
    glyph.textContent = icon
  } else {
    glyph.append(createElement(icon))
  }

  button.append(glyph)
  return button
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

  const menuToggle = createIconButton('Open navigation menu', Menu, 'header__menu-toggle')

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
  const mobileClose = createIconButton('Close navigation menu', X, 'mobile-menu__close')
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

  const { dialog: authDialog, setMode: setAuthMode } = createAuthDialog()
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
  const openAuthDialog = (mode: AuthMode, event?: Event): void => {
    event?.preventDefault()
    closeMenu()
    setAuthMode(mode)
    authDialog.showModal()
  }

  menuToggle.setAttribute('aria-expanded', 'false')
  menuToggle.addEventListener('click', openMenu)
  mobileClose.addEventListener('click', closeMenu)
  mobileLogIn.addEventListener('click', (event) => openAuthDialog('login', event))
  mobileSignUp.addEventListener('click', (event) => openAuthDialog('register', event))
  logIn.addEventListener('click', (event) => openAuthDialog('login', event))
  signUp.addEventListener('click', (event) => openAuthDialog('register', event))
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('is-open') && !authDialog.open) {
      closeMenu()
    }
  })

  mobileMenu.append(mobileMenuHeader, mobileNav, mobileActions)
  header.append(brand, menuToggle, nav, mobileMenu, authDialog)
  return header
}

import './footer.scss'
import logoSource from '../../assets/Logo.svg'
import rssLogo from '../../assets/rss-logo.svg'
import { Code2, MessageCircle, Share2, createElement } from 'lucide'

type FooterLink = { label: string; href: string }

const DESCRIPTION =
  'Take a short break and have fun. Hundreds of curated casual mini-games right in your web browser. No download required.'

const EXPLORE_LINKS: FooterLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Library', href: '/library' },
  { label: 'Categories', href: '/categories' },
  { label: 'Tournaments', href: '/tournaments' },
]

const COMPANY_LINKS: FooterLink[] = [
  { label: 'About Us', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
]

const SOCIAL_LINKS = [
  { label: 'Share', href: '/', icon: Share2 },
  { label: 'Chat', href: '/', icon: MessageCircle },
  { label: 'RSS feed', href: '/', type: 'rss' as const },
]

const SCHOOL_URL = 'https://rs.school/courses/short-track'
const GITHUB_USER = 'systemkiller03'

function create<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag)
  if (className) element.className = className
  if (text) element.textContent = text
  return element
}

function createBrand(): HTMLAnchorElement {
  const brand = create('a', 'footer__brand')
  brand.href = '/'
  brand.setAttribute('aria-label', 'MiniGames home')

  const logo = create('img', 'footer__logo')
  logo.src = logoSource
  logo.alt = ''

  brand.append(logo, create('span', undefined, 'MiniGames'))
  return brand
}

function createLinkColumn(title: string, id: string, links: FooterLink[]): HTMLElement {
  const column = create('nav', 'footer__column')
  column.setAttribute('aria-labelledby', id)

  const heading = create('h2', 'footer__heading', title)
  heading.id = id

  const list = create('ul', 'footer__list')
  for (const { label, href } of links) {
    const item = document.createElement('li')
    const link = create('a', 'footer__link', label)
    link.href = href
    item.append(link)
    list.append(item)
  }

  column.append(heading, list)
  return column
}

function createSocialColumn(): HTMLElement {
  const column = create('div', 'footer__column footer__column--social')
  const heading = create('h2', 'footer__heading', 'Community')
  const list = create('ul', 'footer__social')

  for (const { label, href, icon, type } of SOCIAL_LINKS) {
    const item = document.createElement('li')
    const link = create('a', 'footer__social-link')
    link.href = href
    link.setAttribute('aria-label', label)
    link.title = label

    if (type === 'rss') {
      const rssIcon = document.createElement('img')
      rssIcon.src = rssLogo
      rssIcon.alt = ''
      rssIcon.setAttribute('aria-hidden', 'true')
      link.append(rssIcon)
    } else {
      link.append(createElement(icon))
    }

    item.append(link)
    list.append(item)
  }

  column.append(heading, list)
  return column
}

function createChip(href: string, icon: HTMLElement, label: string): HTMLAnchorElement {
  const chip = create('a', 'footer__chip')
  chip.href = href
  chip.target = '_blank'
  chip.rel = 'noreferrer noopener'
  chip.append(icon, create('span', 'footer__chip-label', label))
  return chip
}

function createBottom(): HTMLElement {
  const bottom = create('div', 'footer__bottom')

  const copyright = create(
    'p',
    'footer__copyright',
    `© ${new Date().getFullYear()} MiniGames. All rights reserved.`,
  )

  const rsIcon = create('span', 'footer__chip-icon footer__chip-icon--rs', 'RS')
  rsIcon.setAttribute('aria-hidden', 'true')

  const codeIcon = create('span', 'footer__chip-icon footer__chip-icon--code')
  codeIcon.setAttribute('aria-hidden', 'true')
  codeIcon.append(createElement(Code2))

  const rssFeedIcon = create('span', 'footer__chip-icon footer__chip-icon--rss')
  rssFeedIcon.setAttribute('aria-hidden', 'true')
  const rssImage = document.createElement('img')
  rssImage.src = rssLogo
  rssImage.alt = ''
  rssFeedIcon.append(rssImage)

  const tagline = create('p', 'footer__tagline', 'Designed with love')

  bottom.append(
    copyright,
    createChip(SCHOOL_URL, rssFeedIcon, 'RS School'),
    createChip(`https://github.com/${GITHUB_USER}`, codeIcon, `@${GITHUB_USER}`),
    tagline,
  )
  return bottom
}

export function createFooter(): HTMLElement {
  const footer = create('footer', 'footer')
  const inner = create('div', 'footer__inner')
  const top = create('div', 'footer__top')

  const about = create('div', 'footer__about')
  about.append(createBrand(), create('p', 'footer__description', DESCRIPTION))

  const columns = create('div', 'footer__columns')
  columns.append(
    createLinkColumn('Explore', 'footer-explore', EXPLORE_LINKS),
    createLinkColumn('Company', 'footer-company', COMPANY_LINKS),
    createSocialColumn(),
  )

  top.append(about, columns)
  inner.append(top, createBottom())
  footer.append(inner)
  return footer
}

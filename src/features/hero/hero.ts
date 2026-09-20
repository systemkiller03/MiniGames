import './hero.scss'
import heroImage from '../../assets/hero-section.png'
import { createButton } from '../../shared/components/button/button'

export function createHero(): HTMLElement {
  const hero = document.createElement('section')
  hero.className = 'hero'
  hero.setAttribute('aria-labelledby', 'hero-title')
  hero.style.setProperty('--hero-image', `url(${heroImage})`)

  const content = document.createElement('div')
  content.className = 'hero__content'

  const title = document.createElement('h1')
  title.id = 'hero-title'
  title.textContent = 'Take a Short Break & Have Fun'

  const description = document.createElement('p')
  description.textContent =
    'Discover hundreds of curated casual mini-games. Play instantly in your browser - puzzle, match 3, farm, and board classics.'

  const button = createButton('Browse Library', 'primary')
  content.append(title, description, button)
  hero.append(content)
  return hero
}

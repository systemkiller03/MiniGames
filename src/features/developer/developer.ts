import './developer.scss'
import illustration from '../../assets/illustration-side.png'
import { createButton } from '../../shared/components/button/button'

export function createDeveloperSection(): HTMLElement {
  const section = document.createElement('section')
  section.className = 'developer'
  section.setAttribute('aria-labelledby', 'developer-title')

  const illustrationElement = document.createElement('img')
  illustrationElement.className = 'developer__illustration'
  illustrationElement.src = illustration
  illustrationElement.alt = 'A game developer working at a computer'

  const content = document.createElement('div')
  content.className = 'developer__content'

  const title = document.createElement('h2')
  title.id = 'developer-title'
  title.textContent = 'Are You a Game Developer?'

  const description = document.createElement('p')
  description.className = 'developer__description'
  description.textContent =
    'Share your game with a community of players who love discovering something new.'

  const button = createButton('Submit Form', 'primary')
  content.append(title, description, button)

  section.append(illustrationElement, content)
  return section
}

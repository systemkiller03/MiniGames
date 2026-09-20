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
  title.className = 'developer__title' // was styled with a bare h2 selector
  title.id = 'developer-title'
  title.textContent = 'Are You a Game Developer?'

  const description = document.createElement('p')
  description.className = 'developer__description'
  description.textContent =
    "Want to see your game on MiniGames? We're always looking for fun, engaging mini games to add to our platform. Submit your game and reach thousands of players!"

  const button = createButton('Submit Form', 'primary')

  const contact = document.createElement('p')
  contact.className = 'developer__contact'
  contact.append('or contact us at ')
  const email = document.createElement('a')
  email.href = 'mailto:developers@minigames.com'
  email.textContent = 'developers@minigames.com'
  contact.append(email)

  content.append(title, description, button, contact)

  section.append(illustrationElement, content)
  return section
}

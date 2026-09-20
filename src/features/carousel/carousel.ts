import './carousel.scss'
import { ArrowLeft, ArrowRight } from 'lucide'
import camperVanCard from '../../assets/camper-van-make-it-home-card.jpg'
import catMailCard from '../../assets/cat-mail-co-card.jpg'
import cozySolitaireCard from '../../assets/cozy-solitaire-card.jpg'
import littleCornersCard from '../../assets/little-corners-card.jpg'
import organizedInsideCard from '../../assets/organized-inside-card.jpg'
import { createIconButton } from '../../shared/components/icon-button/icon-button'

const GAMES = [
  { title: 'Camper Van: Make It Home', image: camperVanCard, likes: '1.2k', rating: '4.8' },
  { title: 'Cat Mail Co.', image: catMailCard, likes: '980', rating: '4.7' },
  { title: 'Cozy Solitaire', image: cozySolitaireCard, likes: '1.6k', rating: '4.9' },
  { title: 'Little Corners', image: littleCornersCard, likes: '842', rating: '4.6' },
  { title: 'Organized Inside', image: organizedInsideCard, likes: '734', rating: '4.5' },
]

type CardSlot = 'peek' | 'side' | 'featured'

function createCard(game: (typeof GAMES)[number], slot: CardSlot): HTMLElement {
  const card = document.createElement('article')
  card.className = `carousel__card carousel__card--${slot}`

  const image = document.createElement('img')
  image.src = game.image
  image.alt = game.title

  const info = document.createElement('div')
  info.className = 'carousel__card-info'
  const title = document.createElement('h3')
  title.textContent = game.title
  title.title = game.title
  const metadata = document.createElement('div')
  metadata.className = 'carousel__card-meta'
  metadata.innerHTML = `<span aria-label="${game.likes} likes">♥ ${game.likes}</span><span aria-label="${game.rating} out of 5 stars">★ ${game.rating}</span>`
  info.append(title, metadata)
  card.append(image, info)
  return card
}

function updateCard(card: HTMLElement, game: (typeof GAMES)[number], slot: CardSlot): void {
  card.className = `carousel__card carousel__card--${slot}`
  const image = card.querySelector('img')
  const title = card.querySelector('h3')
  const metadata = card.querySelector('.carousel__card-meta')
  if (image instanceof HTMLImageElement) {
    image.src = game.image
    image.alt = game.title
  }
  if (title instanceof HTMLHeadingElement) {
    title.textContent = game.title
    title.title = game.title
  }
  if (metadata instanceof HTMLElement) {
    metadata.innerHTML = `<span aria-label="${game.likes} likes">♥ ${game.likes}</span><span aria-label="${game.rating} out of 5 stars">★ ${game.rating}</span>`
  }
}

export function createCarousel(): HTMLElement {
  const section = document.createElement('section')
  section.className = 'carousel'
  section.setAttribute('aria-labelledby', 'carousel-title')

  const heading = document.createElement('div')
  heading.className = 'carousel__heading'
  const title = document.createElement('h2')
  title.id = 'carousel-title'
  title.textContent = 'New Games'

  const controls = document.createElement('div')
  controls.className = 'carousel__controls'
  const previousButton = createIconButton('Previous games', ArrowLeft, 'carousel__arrow')
  const nextButton = createIconButton('Next games', ArrowRight, 'carousel__arrow carousel__arrow--next')
  controls.append(previousButton, nextButton)
  heading.append(title, controls)

  const viewport = document.createElement('div')
  viewport.className = 'carousel__viewport'
  const track = document.createElement('div')
  track.className = 'carousel__track'
  const slots: CardSlot[] = ['peek', 'side', 'featured', 'side', 'peek']
  let orderedGames = [...GAMES]
  const cards = slots.map((slot, index) => createCard(orderedGames[index], slot))
  track.append(...cards)
  viewport.append(track)

  const indicators = document.createElement('div')
  indicators.className = 'carousel__indicators'
  for (let index = 0; index < GAMES.length; index += 1) {
    const indicator = document.createElement('button')
    indicator.type = 'button'
    indicator.setAttribute('aria-label', `Show game ${index + 1}`)
    indicator.className = `carousel__indicator${index === 0 ? ' is-active' : ''}`
    indicators.append(indicator)
  }

  let currentIndex = 0
  const updateIndicators = (): void => {
    for (const [index, indicator] of [...indicators.children].entries()) {
      indicator.classList.toggle('is-active', index === currentIndex)
    }
  }

  const renderCards = (): void => {
    orderedGames = [...GAMES.slice(currentIndex), ...GAMES.slice(0, currentIndex)]
    for (const [index, card] of cards.entries()) {
      updateCard(card, orderedGames[index], slots[index])
    }
    updateIndicators()
  }

  const updateCarousel = (direction: 1 | -1): void => {
    currentIndex = (currentIndex + direction + GAMES.length) % GAMES.length
    renderCards()
  }

  previousButton.addEventListener('click', () => updateCarousel(-1))
  nextButton.addEventListener('click', () => updateCarousel(1))
  for (const [index, indicator] of [...indicators.children].entries()) {
    indicator.addEventListener('click', () => {
      currentIndex = index
      renderCards()
    })
  }

  section.append(heading, viewport, indicators)
  return section
}

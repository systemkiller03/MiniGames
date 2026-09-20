import { createCarousel } from '../../features/carousel/carousel'
import { createDeveloperSection } from '../../features/developer/developer'
import { createFooter } from '../../features/footer/footer'
import { createHeader } from '../../features/header/header'
import { createHero } from '../../features/hero/hero'
import { createLeaderboard } from '../../features/leaderboard/leaderboard'

export function createHomePage(): HTMLElement {
  const page = document.createElement('main')
  page.className = 'home-page'
  page.append(
    createHeader(),
    createHero(),
    createCarousel(),
    createLeaderboard(),
    createDeveloperSection(),
    createFooter(),
  )
  return page
}

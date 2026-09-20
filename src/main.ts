import { createHeader } from './features/header/header'
import { createHero } from './features/hero/hero'
import { createCarousel } from './features/carousel/carousel'
import { createLeaderboard } from './features/leaderboard/leaderboard'
import { createDeveloperSection } from './features/developer/developer'
import './styles/main.scss'

const app: HTMLDivElement = document.createElement('div')
app.id = 'app'
document.body.append(app)
app.append(createHeader())
app.append(createHero())
app.append(createCarousel())
app.append(createLeaderboard())
app.append(createDeveloperSection())

import { createHeader } from './features/header/header'
import { createHero } from './features/hero/hero'
import './styles/main.scss'

const app: HTMLDivElement = document.createElement('div')
app.id = 'app'
document.body.append(app)
app.append(createHeader())
app.append(createHero())

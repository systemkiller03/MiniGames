import { createHeader } from './features/header/header'
import './styles/main.scss'

const app: HTMLDivElement = document.createElement('div')
app.id = 'app'
document.body.append(app)
app.append(createHeader())

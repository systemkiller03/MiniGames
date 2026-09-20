import { createHomePage } from './pages'
import './styles/main.scss'

const app: HTMLDivElement = document.createElement('div')
app.id = 'app'
document.body.append(app)
app.append(createHomePage())

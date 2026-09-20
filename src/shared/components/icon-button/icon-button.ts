import './icon-button.scss'
import { createElement } from 'lucide'

type IconNode = Parameters<typeof createElement>[0]

export function createIconButton(
  label: string,
  icon: string | IconNode,
  className = '',
): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `icon-button${className ? ` ${className}` : ''}`
  button.setAttribute('aria-label', label)

  const glyph = document.createElement('span')
  glyph.className = 'icon-button__glyph'

  if (typeof icon === 'string') {
    glyph.textContent = icon
  } else {
    glyph.append(createElement(icon))
  }

  button.append(glyph)
  return button
}

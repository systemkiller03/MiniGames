import './icon-button.scss'

export function createIconButton(label: string, icon: string, className = ''): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `icon-button${className ? ` ${className}` : ''}`
  button.setAttribute('aria-label', label)
  const glyph = document.createElement('span')
  glyph.className = 'icon-button__glyph'
  glyph.textContent = icon
  button.append(glyph)
  return button
}

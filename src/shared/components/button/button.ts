import './button.scss'

export type ButtonVariant = 'primary' | 'outline'

export function createButton(label: string, variant: ButtonVariant = 'primary'): HTMLButtonElement {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = `btn btn--${variant}`
  button.textContent = label
  return button
}

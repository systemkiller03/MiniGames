import { createHomePage } from '@/pages'
import { createLibraryPage } from '@/pages/library'

const ROUTES: { [key: string]: HTMLElement } = {
  '/': createHomePage(),
  library: createLibraryPage(),
}
export function createRouter(main: HTMLElement): void {
  const path = globalThis.location.pathname
  console.log(path)

  const page = ROUTES[path]
  if (!page) {
    return
  }

  main.replaceWith(page)
  return
}

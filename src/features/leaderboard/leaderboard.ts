import './leaderboard.scss'

const PLAYERS = [
  { rank: '01', name: 'BubblyPea', score: '12,480', games: '87', streak: '8 days' },
  { rank: '02', name: 'CozyMoss', score: '11,920', games: '76', streak: '6 days' },
  { rank: '03', name: 'PixelPanda', score: '10,845', games: '69', streak: '5 days' },
  { rank: '04', name: 'SunnySide', score: '9,760', games: '62', streak: '4 days' },
  { rank: '05', name: 'MoonlitFox', score: '9,210', games: '58', streak: '3 days' },
]

export function createLeaderboard(): HTMLElement {
  const section = document.createElement('section')
  section.className = 'leaderboard'
  section.setAttribute('aria-labelledby', 'leaderboard-title')

  const title = document.createElement('h2')
  title.id = 'leaderboard-title'
  title.textContent = 'Top Players This Week'

  const table = document.createElement('table')
  table.className = 'leaderboard__table'

  const caption = document.createElement('caption')
  caption.textContent = 'Top players ranked by weekly score'
  const head = document.createElement('thead')
  const headerRow = document.createElement('tr')
  for (const label of ['Rank', 'Player', 'Score', 'Games', 'Streak']) {
    const cell = document.createElement('th')
    cell.scope = 'col'
    cell.textContent = label
    headerRow.append(cell)
  }
  head.append(headerRow)

  const body = document.createElement('tbody')
  for (const player of PLAYERS) {
    const row = document.createElement('tr')
    const values = [player.rank, player.name, player.score, player.games, player.streak]
    for (const [index, value] of values.entries()) {
      const cell = document.createElement('td')
      if (index === 0) cell.className = 'leaderboard__rank'
      else if (index === 1) cell.className = 'leaderboard__player'
      cell.textContent = value
      row.append(cell)
    }
    body.append(row)
  }

  table.append(caption, head, body)
  section.append(title, table)
  return section
}

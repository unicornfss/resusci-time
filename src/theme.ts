export type Theme = 'day' | 'night'

const STORAGE_KEY = 'resusci-time-theme'

export function getStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'night' || stored === 'day') return stored
  } catch {
    /* private browsing / blocked storage */
  }
  return 'day'
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme === 'night' ? 'night' : 'day'
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    /* ignore */
  }
}

export function initTheme() {
  applyTheme(getStoredTheme())
}

export function toggleTheme(): Theme {
  const next: Theme = getStoredTheme() === 'night' ? 'day' : 'night'
  applyTheme(next)
  return next
}

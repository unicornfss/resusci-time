import { useSyncExternalStore } from 'react'
import { getStoredTheme, toggleTheme, type Theme } from '../theme'

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
  return () => observer.disconnect()
}

function getThemeSnapshot(): Theme {
  return document.documentElement.dataset.theme === 'night' ? 'night' : 'day'
}

function getServerThemeSnapshot(): Theme {
  return getStoredTheme()
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getServerThemeSnapshot)
  const night = theme === 'night'

  return (
    <button
      type="button"
      className="theme-toggle"
      aria-pressed={night}
      onClick={() => toggleTheme()}
    >
      {night ? 'Day mode' : 'Night mode'}
    </button>
  )
}

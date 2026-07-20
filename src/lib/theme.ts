'use client'

import { useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

/** The same key must be in the script in <head> in layout.tsx. */
export const THEME_STORAGE_KEY = 'questmind-theme'

const DARK_QUERY = '(prefers-color-scheme: dark)'

const listeners = new Set<() => void>()

/** Cache in module — useSyncExternalStore requires a stable snapshot. */
let current: Theme | null = null

function readStoredTheme(): Theme {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (value === 'dark' || value === 'light' || value === 'system') {
      return value
    }
  } catch {}
  return 'system'
}

function getSnapshot(): Theme {
  if (current === null) current = readStoredTheme()
  return current
}

/** On the server, we don't know the user's choice — always the same value. */
function getServerSnapshot(): Theme {
  return 'system'
}

function subscribe(onStoreChange: () => void) {
  listeners.add(onStoreChange)

  // On the server, we don't know the user's choice — always the same value.
  const media = window.matchMedia(DARK_QUERY)
  const handleSystemChange = () => {
    if (getSnapshot() === 'system') {
      applyTheme()
      listeners.forEach((listener) => listener())
    }
  }
  media.addEventListener('change', handleSystemChange)

  return () => {
    listeners.delete(onStoreChange)
    media.removeEventListener('change', handleSystemChange)
  }
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme !== 'system') return theme
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

/** Applies a theme to the <html> element. Same logic as in the script in <head>. */
export function applyTheme() {
  const resolved = resolveTheme(getSnapshot())
  const root = document.documentElement
  root.classList.toggle('dark', resolved === 'dark')
  root.classList.toggle('light', resolved === 'light')
  root.style.colorScheme = resolved
}

export function setTheme(theme: Theme) {
  current = theme
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // no storage = the choice won't persist after a reload, but the session will work
  }
  applyTheme()
  listeners.forEach((listener) => listener())
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return { theme, setTheme }
}

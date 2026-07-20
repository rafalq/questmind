'use client'

import { resolveTheme, useTheme } from '@/lib/theme'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={() =>
        setTheme(resolveTheme(theme) === 'dark' ? 'light' : 'dark')
      }
      aria-label="Toggle dark and light theme"
      title="Toggle theme"
      className="inline-flex h-9 w-9 items-center justify-center border border-border text-text-secondary transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <Sun
        className="hidden h-4 w-4 dark:block"
        strokeWidth={1.5}
        aria-hidden="true"
      />
      <Moon
        className="h-4 w-4 dark:hidden"
        strokeWidth={1.5}
        aria-hidden="true"
      />
    </button>
  )
}

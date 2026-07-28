'use client'

import { useCallback, useEffect, useState } from 'react'

type UseZenModeOptions = {
  /** Also drive the browser Fullscreen API — the real win on a TV, where it
   *  removes the browser chrome the overlay can't reach. */
  fullscreen?: boolean
}

/**
 * Distraction-free reading mode for the chat panel.
 *
 * Sets data-zen on <html> so global CSS can hide the game header and stats
 * panel and blow the chat column up to a fixed, full-viewport stage. When
 * `fullscreen` is on it also requests the Fullscreen API.
 *
 * Exit via toggle(), Escape, or leaving fullscreen natively (remote / F11).
 */
export function useZenMode({ fullscreen = true }: UseZenModeOptions = {}) {
  const [isZen, setIsZen] = useState(false)

  const enter = useCallback(async () => {
    setIsZen(true)
    // requestFullscreen must run inside the click's call stack (before any
    // await) to count as a user gesture — it does.
    if (fullscreen && document.documentElement.requestFullscreen) {
      try {
        await document.documentElement.requestFullscreen()
      } catch {
        // Fullscreen may be blocked; zen still works without it.
      }
    }
  }, [fullscreen])

  const exit = useCallback(async () => {
    setIsZen(false)
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch {
        // ignore
      }
    }
  }, [])

  const toggle = useCallback(() => {
    if (isZen) void exit()
    else void enter()
  }, [isZen, enter, exit])

  // Reflect state onto <html> for the global CSS.
  useEffect(() => {
    document.documentElement.toggleAttribute('data-zen', isZen)
    return () => document.documentElement.removeAttribute('data-zen')
  }, [isZen])

  // Escape exits (covers the non-fullscreen case).
  useEffect(() => {
    if (!isZen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void exit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isZen, exit])

  // If the user leaves fullscreen natively, drop zen with it.
  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setIsZen(false)
    }
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  return { isZen, enter, exit, toggle }
}

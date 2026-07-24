'use client'

import { useCallback, useState } from 'react'

const DESKTOP = '(min-width: 1024px)'

/**
 * Open/closed state for the stats panel, which is an overlay drawer below lg
 * and an in-flow column at lg and up.
 *
 * `null` means the player has not chosen yet, so the default is left to CSS:
 * closed on mobile, open on desktop. Deriving that default from matchMedia in
 * an effect would mean rendering the wrong state first and correcting it after
 * paint - a visible flash, and a cascading render React now warns about. Once
 * the toggle is clicked the value becomes a boolean and takes over from the
 * breakpoint for the rest of the session.
 */
export function useSidePanel() {
  const [isOpen, setIsOpen] = useState<boolean | null>(null)

  // Reading the viewport inside an event handler is fine - it happens after
  // mount, in response to a user action, not during render.
  const isDesktop = () => window.matchMedia(DESKTOP).matches

  const toggle = useCallback(() => {
    setIsOpen((prev) => !(prev ?? isDesktop()))
  }, [])

  const close = useCallback(() => setIsOpen(false), [])

  // Panel geometry. The null case carries both breakpoints in one class list;
  // the boolean cases pin the panel regardless of viewport width.
  const panelClass =
    isOpen === null
      ? 'translate-x-full lg:w-72 lg:translate-x-0'
      : isOpen
        ? 'translate-x-0 lg:w-72'
        : 'translate-x-full lg:w-0 lg:overflow-hidden lg:border-l-0'

  return { isOpen, toggle, close, panelClass, isDesktop }
}

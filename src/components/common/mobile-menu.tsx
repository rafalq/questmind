'use client'

import { useEffect, useId, useState } from 'react'
import { usePathname } from 'next/navigation'
import NavLink from '../ui/nav-link'
import { ROUTES } from '@/constants/routes'
import {
  IconLayoutDashboard,
  IconLogin2,
  IconMenu2,
  IconSquareLetterI,
  IconUserPlus,
  IconWorldMap,
  IconX,
} from '@tabler/icons-react'

type MobileMenuProps = {
  isSignedIn: boolean
}

export default function MobileMenu({ isSignedIn }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuId = useId()
  const pathname = usePathname()

  // A client-side navigation swaps the page out from under an open menu, so
  // the menu has to go with it. Adjusting state during render — React's
  // documented pattern for reacting to a changed value — rather than an
  // effect, which would close the menu only after the new page had painted
  // and would trip the set-state-in-effect lint. The onClick on the container
  // covers link taps; this covers browser back/forward and programmatic
  // navigation, which never fire that handler.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (pathname !== lastPathname) {
    setLastPathname(pathname)
    setIsOpen(false)
  }

  // Escape closes the menu. Subscribing to a browser event and calling
  // setState from the callback is exactly what effects are for — unlike
  // deriving state in the effect body. Bound only while open so there is no
  // stray listener on every page.
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-controls={menuId}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        className="-m-2 p-2 text-text-secondary transition-colors hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {isOpen ? (
          <IconX stroke={2} size={22} />
        ) : (
          <IconMenu2 stroke={2} size={22} />
        )}
      </button>

      {isOpen && (
        <>
          {/* Tapping anywhere outside dismisses the menu. Rendered behind the
              panel and below the navbar's own stacking, so the toggle button
              stays reachable and can still close the menu itself. */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden
          />

          <div
            id={menuId}
            // Clicking any link inside bubbles up here and closes the menu.
            onClick={() => setIsOpen(false)}
            // shadow-lg matters in the light theme: the panel shares its
            // background with the page beneath it, so without a shadow there
            // is no visible edge where the menu ends.
            className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-b border-border bg-bg-base px-4 py-4 shadow-lg"
          >
            <NavLink href={ROUTES.about} className="py-2">
              <IconSquareLetterI stroke={2} size={16} />
              About
            </NavLink>
            <NavLink href={ROUTES.worlds} className="py-2">
              <IconWorldMap stroke={2} size={16} />
              Worlds
            </NavLink>

            {isSignedIn ? (
              <NavLink href={ROUTES.dashboard} className="py-2">
                <IconLayoutDashboard stroke={2} size={16} />
                Dashboard
              </NavLink>
            ) : (
              <>
                <NavLink href={ROUTES.signIn} className="py-2">
                  <IconLogin2 stroke={2} size={16} />
                  Sign In
                </NavLink>
                <NavLink href={ROUTES.signUp} className="py-2">
                  <IconUserPlus stroke={2} size={16} />
                  Get Started
                </NavLink>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

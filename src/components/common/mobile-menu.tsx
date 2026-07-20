'use client'

import { useState } from 'react'
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

  return (
    <div className="sm:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        className="p-2 -m-2 text-text-secondary hover:text-accent transition-colors"
      >
        {isOpen ? (
          <IconX stroke={2} size={22} />
        ) : (
          <IconMenu2 stroke={2} size={22} />
        )}
      </button>

      {isOpen && (
        <div
          // clicking any link inside bubbles up here and closes the menu
          onClick={() => setIsOpen(false)}
          className="absolute inset-x-0 top-full z-50 flex flex-col gap-1 px-4 py-4 bg-bg-base border-b border-border"
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
      )}
    </div>
  )
}

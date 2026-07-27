import { ROUTES } from '@/constants/routes'
import { IconSquareLetterI, IconWorldMap } from '@tabler/icons-react'
import Logo from '../brand/logo'
import NavLink from '../ui/nav-link'
import ThemeToggle from '../ui/theme/theme-toggle'
import MobileMenu from './mobile-menu'
import NavbarAuth from './navbar-auth'

export default function Navbar() {
  return (
    <header className="border-border bg-bg-base/80 sticky top-0 z-40 border-b backdrop-blur-sm">
      <nav
        aria-label="Main"
        className="flex items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5"
      >
        <div className="flex items-center gap-3 sm:gap-6">
          {/* one logo — the wordmark itself is what collapses below 25rem */}
          <Logo size="md" />
          <ThemeToggle />
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <NavLink href={ROUTES.about} className="hidden sm:inline-flex">
            <IconSquareLetterI stroke={2} size={16} />
            About
          </NavLink>
          <NavLink href={ROUTES.worlds} className="hidden sm:inline-flex">
            <IconWorldMap stroke={2} size={16} />
            Worlds
          </NavLink>

          {/*
            Auth cluster. NavbarAuth is a client component driven by useAuth(),
            so it reflects the live Clerk session and flips on sign-in / sign-out
            without a manual refresh. The reserved min height and width keep the
            row from shifting sideways while Clerk hydrates (NFR-001, NFR-004).
          */}
          <div className="flex min-h-8 min-w-8 items-center justify-end gap-3 sm:min-w-32 sm:gap-6">
            <NavbarAuth />

            {/* hamburger with all links, mobile only */}
            <MobileMenu />
          </div>
        </div>
      </nav>
    </header>
  )
}

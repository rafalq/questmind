import { ROUTES } from '@/constants/routes'
import { Show, UserButton } from '@clerk/nextjs'
import {
  IconLayoutDashboard,
  IconLogin2,
  IconSquareLetterI,
  IconUserPlus,
  IconWorldMap,
} from '@tabler/icons-react'
import Logo from '../brand/logo'
import NavLink from '../ui/nav-link'
import ThemeToggle from '../ui/theme/theme-toggle'
import MobileMenu from './mobile-menu'

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
            Auth cluster. Clerk's Show control component resolves auth state on
            the client and stays reactive, so signing in or out updates the
            navbar immediately — no manual refresh, no stale Router Cache. The
            ClerkProvider is SSR-aware, so the correct branch is rendered on the
            first server paint; there is no flash of the signed-out state. The
            reserved min height and width keep the row from shifting sideways
            while Clerk hydrates (NFR-001, NFR-004).

            Show replaces the v6 SignedIn/SignedOut components, which were
            consolidated into a single component in Clerk Core 3 (@clerk/nextjs v7).
          */}
          <div className="flex min-h-8 min-w-8 items-center justify-end gap-3 sm:min-w-32 sm:gap-6">
            {/* desktop links (sm and up) — signed-out state */}
            <Show when="signed-out">
              <NavLink href={ROUTES.signIn} className="hidden sm:inline-flex">
                <IconLogin2 stroke={2} size={16} />
                Sign In
              </NavLink>
              <NavLink href={ROUTES.signUp} className="hidden sm:inline-flex">
                <IconUserPlus stroke={2} size={16} />
                Get Started
              </NavLink>
            </Show>

            {/* desktop link + avatar — signed-in state (avatar on every size) */}
            <Show when="signed-in">
              <NavLink
                href={ROUTES.dashboard}
                className="hidden sm:inline-flex"
              >
                <IconLayoutDashboard stroke={2} size={16} />
                Dashboard
              </NavLink>
              <UserButton />
            </Show>

            {/* hamburger with all links, mobile only */}
            <MobileMenu />
          </div>
        </div>
      </nav>
    </header>
  )
}

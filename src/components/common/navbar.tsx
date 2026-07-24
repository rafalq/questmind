import { ROUTES } from '@/constants/routes'
import { UserButton } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import {
  IconLayoutDashboard,
  IconLogin2,
  IconSquareLetterI,
  IconUserPlus,
  IconWorldMap,
} from '@tabler/icons-react'
import { connection } from 'next/server'
import { Suspense } from 'react'
import Logo from '../brand/logo'
import Spinner from '../ui/loader/spinner'
import NavLink from '../ui/nav-link'
import ThemeToggle from '../ui/theme/theme-toggle'
import MobileMenu from './mobile-menu'

async function NavAuth() {
  await connection()
  const { userId } = await auth()
  const isSignedIn = !!userId

  return (
    <>
      {/* desktop links (sm and up) */}
      {isSignedIn ? (
        <NavLink href={ROUTES.dashboard} className="hidden sm:inline-flex">
          <IconLayoutDashboard stroke={2} size={16} />
          Dashboard
        </NavLink>
      ) : (
        <>
          <NavLink href={ROUTES.signIn} className="hidden sm:inline-flex">
            <IconLogin2 stroke={2} size={16} />
            Sign In
          </NavLink>
          <NavLink href={ROUTES.signUp} className="hidden sm:inline-flex">
            <IconUserPlus stroke={2} size={16} />
            Get Started
          </NavLink>
        </>
      )}

      {/* avatar stays visible on every size */}
      {isSignedIn && <UserButton />}

      {/* hamburger with all links, mobile only */}
      <MobileMenu isSignedIn={isSignedIn} />
    </>
  )
}

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
            The fallback reserves height and a minimum width, so the nav does
            not jump sideways when the auth-dependent subtree streams in.
          */}
          <Suspense
            fallback={
              <div
                className="flex min-h-8 min-w-8 items-center justify-end sm:min-w-32"
                aria-hidden
              >
                <Spinner size="md" />
              </div>
            }
          >
            <div className="flex min-h-8 items-center gap-3 sm:gap-6">
              <NavAuth />
            </div>
          </Suspense>
        </div>
      </nav>
    </header>
  )
}

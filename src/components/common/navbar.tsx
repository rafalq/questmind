import Link from 'next/link'
import { connection } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { Suspense } from 'react'
import Spinner from '../ui/loader/spinner'
import { ROUTES } from '@/constants/routes'
import NavLink from '../ui/nav-link'
import MobileMenu from './mobile-menu'
import {
  IconLayoutDashboard,
  IconLogin2,
  IconSquareLetterI,
  IconUserPlus,
  IconWorldMap,
} from '@tabler/icons-react'
import ThemeToggle from '../ui/theme/theme-toggle'

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
    <nav className="relative flex items-center justify-between gap-3 px-4 py-4 sm:px-8 sm:py-5 border-b border-border">
      <div className="flex gap-3 sm:gap-6 items-center">
        <Link
          href={ROUTES.home}
          className="text-lg sm:text-xl tracking-widest text-accent hover:text-accent-hover font-bold whitespace-nowrap"
        >
          QUESTMIND
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex gap-3 sm:gap-6 items-center">
        <NavLink href={ROUTES.about} className="hidden sm:inline-flex">
          <IconSquareLetterI stroke={2} size={16} />
          About
        </NavLink>
        <NavLink href={ROUTES.worlds} className="hidden sm:inline-flex">
          <IconWorldMap stroke={2} size={16} />
          Worlds
        </NavLink>
        <Suspense fallback={<Spinner size="md" />}>
          <NavAuth />
        </Suspense>
      </div>
    </nav>
  )
}

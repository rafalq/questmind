'use client'

import { ROUTES } from '@/constants/routes'
import { UserButton, useAuth } from '@clerk/nextjs'
import {
  IconLayoutDashboard,
  IconLogin2,
  IconUserPlus,
} from '@tabler/icons-react'
import NavLink from '../ui/nav-link'
import Spinner from '../ui/loader/spinner'

// Explicit client boundary that subscribes to Clerk's live auth state through
// useAuth(). This is what makes the navbar flip the instant the session
// changes (sign-in / sign-out) with no page refresh. Driving the same logic
// from a Server Component can hand back a one-time server snapshot instead of
// a live subscription — which is exactly the "stale until reload" symptom —
// so the auth cluster is isolated here as its own client component.
export default function NavbarAuth() {
  const { isLoaded, isSignedIn } = useAuth()

  // While Clerk hydrates, render nothing but let the parent hold the row's
  // width (see the reserved min-w on the wrapper in navbar.tsx) so there is no
  // layout shift.
  if (!isLoaded) {
    return <Spinner size="md" />
  }

  if (isSignedIn) {
    return (
      <>
        <NavLink href={ROUTES.dashboard} className="hidden sm:inline-flex">
          <IconLayoutDashboard stroke={2} size={16} />
          Dashboard
        </NavLink>
        <UserButton />
      </>
    )
  }

  return (
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
  )
}

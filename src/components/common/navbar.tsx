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
import Link from 'next/link'
import { connection } from 'next/server'
import { Suspense } from 'react'
import Spinner from '../ui/loader/spinner'
import NavLink from '../ui/nav-link'
import ThemeToggle from '../ui/theme/theme-toggle'

async function NavAuth() {
  await connection()
  const { userId } = await auth()

  return userId ? (
    <>
      <NavLink href={ROUTES.dashboard}>
        <IconLayoutDashboard stroke={2} size={16} />
        Dashboard
      </NavLink>
      <UserButton />
    </>
  ) : (
    <>
      <NavLink href={ROUTES.signIn}>
        <IconLogin2 stroke={2} size={16} />
        Sign In
      </NavLink>
      <NavLink href={ROUTES.signUp}>
        <IconUserPlus stroke={2} size={16} />
        Get Started
      </NavLink>
    </>
  )
}

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
      <div className="flex items-center justify-between gap-8">
        <Link
          href={ROUTES.home}
          className="text-xl tracking-widest text-accent hover:text-accent-hover font-bold"
        >
          QUESTMIND
        </Link>
        <ThemeToggle />
      </div>
      <div className="flex gap-6 items-center">
        <NavLink href={ROUTES.about} className="hidden sm:inline-flex">
          <IconSquareLetterI stroke={2} size={16} />
          About{' '}
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

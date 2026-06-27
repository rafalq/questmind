import Link from 'next/link'
import { connection } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { Suspense } from 'react'
import Spinner from '../ui/loader/spinner'
import { ROUTES } from '@/constants/routes'
import NavLink from '../ui/nav-link'

async function NavAuth() {
  await connection()
  const { userId } = await auth()

  return userId ? (
    <>
      <NavLink href={ROUTES.dashboard}>Dashboard</NavLink>
      <UserButton />
    </>
  ) : (
    <>
      <NavLink href={ROUTES.signIn}>Sign In</NavLink>
      <NavLink href={ROUTES.signUp}>Get Started</NavLink>
    </>
  )
}

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
      <Link
        href={ROUTES.home}
        className="text-xl tracking-widest text-accent hover:text-accent-hover font-bold"
      >
        QUESTMIND
      </Link>
      <div className="flex gap-4 items-center">
        <Suspense fallback={<Spinner size="md" />}>
          <NavAuth />
        </Suspense>
      </div>
    </nav>
  )
}

import Link from 'next/link'
import { connection } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { UserButton } from '@clerk/nextjs'
import { Suspense } from 'react'
import Spinner from '../ui/loader/spinner'
import { ROUTES } from '@/constants/routes'

async function NavAuth() {
  await connection()
  const { userId } = await auth()

  return userId ? (
    <>
      <Link
        href={ROUTES.dashboard}
        className="text-sm tracking-wider text-text-secondary hover:text-accent transition-colors"
      >
        Dashboard
      </Link>
      <UserButton />
    </>
  ) : (
    <>
      <Link
        href={ROUTES.signIn}
        className="text-sm tracking-wider text-text-secondary hover:text-accent transition-colors"
      >
        Sign In
      </Link>
      <Link
        href={ROUTES.signUp}
        className="text-sm tracking-wider px-5 py-2 border border-accent text-accent hover:bg-accent hover:text-accent-fg transition-all"
      >
        Get Started
      </Link>
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

import { ROUTES } from '@/constants/routes'
import Link from 'next/link'

import Logo from '../brand/logo'

export default function Footer() {
  return (
    <footer className="border-border text-text-muted border-t px-4 py-6 sm:px-8">
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        {/*
          href={null} on purpose: the navbar already owns the link home, and a
          second one with the same accessible name is noise when tabbing.
          wordmark is forced on — the footer never gets tight enough to need
          the responsive collapse.
        */}
        <Logo size="sm" tone="muted" wordmark href={null} />

        <div className="flex flex-col items-center gap-2 text-xs sm:flex-row sm:gap-4">
          <Link
            href={ROUTES.about}
            className="hover:text-text-secondary transition-colors"
          >
            About
          </Link>
          <Link
            href={ROUTES.worlds}
            className="hover:text-text-secondary transition-colors"
          >
            Worlds
          </Link>
          <span className="text-center sm:text-left">
            © {new Date().getFullYear()} · AI-Powered Tabletop RPG Game Master
          </span>
        </div>
      </div>
    </footer>
  )
}

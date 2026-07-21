import Link from 'next/link'
import { twMerge } from 'tailwind-merge'

type NavLinkProps = {
  href: string
  children: React.ReactNode
  className?: string
}

export default function NavLink({
  href,
  children,
  className = '',
}: NavLinkProps) {
  return (
    <Link
      href={href}
      className={twMerge(
        'flex items-center gap-2 text-sm tracking-wider text-text-secondary transition-colors hover:text-accent',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
        className
      )}
    >
      {children}
    </Link>
  )
}

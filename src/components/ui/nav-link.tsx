import Link from 'next/link'

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
      className={`text-sm tracking-wider text-text-secondary hover:text-accent transition-colors ${className}`}
    >
      {children}
    </Link>
  )
}

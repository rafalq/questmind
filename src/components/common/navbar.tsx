import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-border">
      <Link
        href="/"
        className="text-xl tracking-widest text-accent hover:text-accent-hover font-bold"
      >
        QUESTMIND
      </Link>
      <div className="flex gap-4 items-center">
        <Link
          href="/sign-in"
          className="text-sm tracking-wider text-text-secondary hover:text-accent transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="text-sm tracking-wider px-5 py-2 border border-accent text-accent hover:bg-accent hover:text-accent-fg transition-all"
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}

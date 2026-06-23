import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-[#2a2016]">
      <Link
        href="/"
        className="text-xl tracking-widest text-[#c9a84c] hover:text-[#debb6a] font-bold"
      >
        QUESTMIND
      </Link>
      <div className="flex gap-4 items-center">
        <Link
          href="/sign-in"
          className="text-sm tracking-wider text-[#a89060] hover:text-[#c9a84c] transition-colors"
        >
          Sign In
        </Link>
        <Link
          href="/sign-up"
          className="text-sm tracking-wider px-5 py-2 border border-[#c9a84c] text-[#c9a84c] hover:bg-[#c9a84c] hover:text-[#0a0805] transition-all"
        >
          Get Started
        </Link>
      </div>
    </nav>
  )
}

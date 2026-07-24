import type { ReactNode } from 'react'

// The small uppercase label above a section heading. It appeared eight times
// across the three marketing pages as a literal class string, and had already
// drifted: one copy had lost `sm:tracking-[0.4em]`, so that one label stopped
// widening on desktop while the others did.
const BASE =
  'text-[10px] uppercase tracking-[0.3em] text-accent sm:text-xs sm:tracking-[0.4em]'

// The hero variant is the same label inside a hairline box.
const BOXED = 'border border-accent px-3 py-2 sm:px-4'

type Props = {
  children: ReactNode
  boxed?: boolean
  /** Spacing only. Nothing here should override the tokens above. */
  className?: string
}

export default function SectionEyebrow({
  children,
  boxed = false,
  className = '',
}: Props) {
  return (
    <p className={`${BASE} ${boxed ? BOXED : ''} ${className}`}>{children}</p>
  )
}

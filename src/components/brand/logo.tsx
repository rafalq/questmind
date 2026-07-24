import Link from 'next/link'
import { QuestMindMark } from '@/components/brand/questmind-mark'

const sizes = {
  sm: { mark: 'size-6', text: 'text-base', gap: 'gap-2' },
  md: { mark: 'size-8', text: 'text-xl', gap: 'gap-2.5' },
  lg: { mark: 'size-12', text: 'text-3xl', gap: 'gap-3' },
} as const

type LogoProps = {
  size?: keyof typeof sizes
  /**
   * true   — wordmark always visible
   * false  — mark only
   * 'auto' — wordmark appears from the xs breakpoint (25rem) up, so a 360px
   *          viewport gets the mark alone. See NFR-004.
   */
  wordmark?: boolean | 'auto'
  /** 'accent' for primary placements, 'muted' for the footer. */
  tone?: 'accent' | 'muted'
  /** Pass null to render a non-interactive logo (e.g. in the footer). */
  href?: string | null
  className?: string
}

export default function Logo({
  size = 'md',
  wordmark = 'auto',
  tone = 'accent',
  href = '/',
  className = '',
}: LogoProps) {
  const s = sizes[size]
  const markTone = tone === 'accent' ? 'text-accent' : 'text-text-muted'

  const inner = (
    <>
      <QuestMindMark className={`${s.mark} ${markTone} shrink-0`} aria-hidden />
      {wordmark !== false && (
        <span
          className={`${s.text} leading-none tracking-wide whitespace-nowrap ${
            wordmark === 'auto' ? 'xs:inline hidden' : ''
          }`}
        >
          {/* Rajdhani, inherited from body. Weight carries the contrast so the
              wordmark stays genre-neutral across all three worlds. */}
          <span className="text-text-primary font-bold">Quest</span>
          <span className="text-text-secondary font-normal">Mind</span>
        </span>
      )}
    </>
  )

  const base = `inline-flex items-center ${s.gap} ${className}`

  // role="img" + aria-label makes the whole lockup read as one name instead of
  // the wordmark being announced letter-group by letter-group.
  if (!href) {
    return (
      <span role="img" aria-label="QuestMind" className={base}>
        {inner}
      </span>
    )
  }

  return (
    <Link
      href={href}
      aria-label="QuestMind — home"
      className={`${base} focus-visible:ring-accent rounded-md transition-opacity hover:opacity-80 focus-visible:ring-2 focus-visible:outline-none`}
    >
      {inner}
    </Link>
  )
}

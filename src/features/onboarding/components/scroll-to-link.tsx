'use client'

type Props = {
  targetId: string
  label: string
}

// A same-page anchor stops working after the first click: once the URL carries
// the hash, clicking a link to that same hash is not a navigation, so the
// browser does nothing. This bypasses href entirely and scrolls imperatively,
// so it fires every time regardless of the current hash.
export default function ScrollToLink({ targetId, label }: Props) {
  const onClick = () => {
    document
      .getElementById(targetId)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-2 inline-flex cursor-pointer items-center gap-1 text-[11px] uppercase tracking-widest text-accent underline-offset-4 transition-colors hover:text-accent-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{ fontFamily: 'var(--font-rajdhani)' }}
    >
      {label} ↓
    </button>
  )
}

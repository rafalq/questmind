// Sits in the same segment as the session page.tsx. Next wraps the page in a
// <Suspense> with this as the fallback, so navigation commits immediately and
// the player sees the session layout instead of a frozen dashboard.
//
// Mirrors the GameScreen structure (header / chat column / stats column /
// composer) rather than showing a spinner: the layout does not shift when the
// real content arrives, which is the whole point of a skeleton.
export default function PlayLoading() {
  return (
    <div
      className="flex h-full min-h-0 flex-col"
      role="status"
      aria-busy="true"
      aria-label="Loading session"
    >
      {/* Header: campaign name + character summary */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Shimmer className="h-9 w-9 rounded-full" />
          <div className="flex min-w-0 flex-col gap-2">
            <Shimmer className="h-4 w-40" />
            <Shimmer className="h-3 w-24" />
          </div>
        </div>
        <Shimmer className="h-8 w-8" />
      </div>

      <div className="flex min-h-0 flex-1 gap-4 p-4 sm:p-6">
        {/* Chat column */}
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <MessageSkeleton align="left" lines={4} />
          <MessageSkeleton align="right" lines={1} />
          <MessageSkeleton align="left" lines={3} />
          <MessageSkeleton align="right" lines={1} />
          <MessageSkeleton align="left" lines={2} />
        </div>

        {/* Stats column — hidden on narrow screens, matching the live screen */}
        <div className="hidden w-72 shrink-0 flex-col gap-4 lg:flex">
          <div className="flex flex-col gap-3 border border-border p-4">
            <Shimmer className="h-3 w-16" />
            <Shimmer className="h-2 w-full" />
            <Shimmer className="h-3 w-20" />
          </div>
          <div className="flex flex-col gap-3 border border-border p-4">
            <Shimmer className="h-3 w-20" />
            {Array.from({ length: 3 }).map((_, i) => (
              <Shimmer key={i} className="h-3 w-full" />
            ))}
          </div>
          <div className="flex flex-col gap-3 border border-border p-4">
            <Shimmer className="h-3 w-16" />
            {Array.from({ length: 2 }).map((_, i) => (
              <Shimmer key={i} className="h-3 w-4/5" />
            ))}
          </div>
        </div>
      </div>

      {/* Composer pinned to the bottom, same as the live screen */}
      <div className="shrink-0 border-t border-border p-4 sm:px-6">
        <Shimmer className="h-11 w-full" />
      </div>

      <span className="sr-only">Loading your session…</span>
    </div>
  )
}

function MessageSkeleton({
  align,
  lines,
}: {
  align: 'left' | 'right'
  lines: number
}) {
  return (
    <div
      className={`flex w-full ${align === 'right' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex w-full flex-col gap-2 ${
          align === 'right' ? 'max-w-[60%] items-end' : 'max-w-[85%]'
        }`}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <Shimmer
            key={i}
            className="h-3"
            // Last line of a paragraph is short, like real prose.
            style={{ width: i === lines - 1 ? '55%' : '100%' }}
          />
        ))}
      </div>
    </div>
  )
}

// Uses the existing border token so it reads in both themes. animate-pulse is
// a Tailwind core utility, no config change needed.
function Shimmer({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      aria-hidden
      className={`animate-pulse bg-border/60 ${className || ''}`}
      style={style}
    />
  )
}

import { Skeleton } from '@/components/ui/loader/skeleton/skeleton'

/**
 * Route-level Suspense fallback for the session screen.
 *
 * Sits in the same segment as page.tsx, so Next wraps the page in a boundary
 * with this as the fallback and navigation commits immediately instead of
 * holding the dashboard on screen while the session query runs.
 *
 * The structure mirrors GameScreen: header row, chat column capped at 68ch,
 * stats column from lg up, composer pinned to the bottom.
 */
export default function PlayLoading() {
  return (
    <div
      className="relative flex min-h-0 flex-1 overflow-hidden bg-bg-base"
      role="status"
      aria-busy="true"
    >
      {/* Left: chat */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header — back arrow, campaign name, panel toggle */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <Skeleton className="h-5 w-5 shrink-0" />
          <Skeleton className="h-5 w-40 sm:w-56" />
          <Skeleton className="h-5 w-5 shrink-0" />
        </div>

        {/* Message list. Same padding and 68ch column as ChatPanel, so the
            prose lands on the axis the placeholder lines occupied. */}
        <div className="flex-1 overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
          <div className="mx-auto flex w-full max-w-[68ch] flex-col gap-6">
            <MessageSkeleton lines={4} />
            <MessageSkeleton lines={1} align="right" />
            <MessageSkeleton lines={3} />
            <MessageSkeleton lines={1} align="right" />
            <MessageSkeleton lines={2} />
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-border px-4 py-4 sm:px-6">
          <div className="mx-auto flex w-full max-w-[68ch] items-stretch gap-3">
            <Skeleton className="h-18 flex-1" />
            <Skeleton className="h-18 w-20" />
          </div>
        </div>
      </div>

      {/* Right: stats. Column from lg up only — below that the real panel is an
          off-canvas drawer, and a skeleton for something the player cannot see
          is just wasted paint. */}
      <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-hidden border-l border-border bg-bg-surface p-4 lg:flex">
        <StatBlock rows={2} />
        <StatBlock rows={4} />
        <StatBlock rows={3} />
      </aside>

      <span className="sr-only">Loading your session…</span>
    </div>
  )
}

function MessageSkeleton({
  lines,
  align = 'left',
}: {
  lines: number
  align?: 'left' | 'right'
}) {
  return (
    <div
      className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`flex w-full flex-col gap-2 ${
          align === 'right' ? 'max-w-[85%] items-end' : 'max-w-[85%]'
        }`}
      >
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-3"
            style={{ width: i === lines - 1 ? '55%' : '100%' }}
          />
        ))}
      </div>
    </div>
  )
}

function StatBlock({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-3 border border-border p-4">
      <Skeleton className="h-3 w-16" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-3 w-full" />
      ))}
    </div>
  )
}

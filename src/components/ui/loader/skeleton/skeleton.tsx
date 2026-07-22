import { clsx } from 'clsx'

type SkeletonProps = {
  className?: string
  style?: React.CSSProperties
}

/**
 * The base placeholder block.
 *
 * bg-gray-300/40 was a fixed grey: light enough to vanish against the light
 * theme's cream page and dark enough to look like a real element on the dark
 * one. bg-border is the token every divider and card outline in the app
 * already uses, so a skeleton now reads as "this app, not yet filled in" in
 * both themes instead of as a stray grey rectangle.
 *
 * No default rounding either. Nothing else in QuestMind is rounded — cards,
 * inputs, buttons and modals all have square corners — so rounded-md made the
 * loading state the only rounded surface on screen. Callers that need a curve
 * (the avatar below) ask for it.
 */
export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      aria-hidden
      style={style}
      className={clsx('animate-pulse bg-border', className)}
    />
  )
}

export function SkeletonInput() {
  return <Skeleton className="h-10 w-full" />
}

export function SkeletonButton() {
  return <Skeleton className="h-10 w-full" />
}

export function SkeletonAvatar() {
  return <Skeleton className="h-12 w-12 rounded-full" />
}

export function SkeletonText({ width = 'w-full' }: { width?: string }) {
  return <Skeleton className={`h-4 ${width}`} />
}

export function SkeletonCard({ className }: SkeletonProps) {
  return <Skeleton className={clsx('h-32 w-full', className)} />
}

/**
 * Paragraph of placeholder lines. The last one is short, the way real prose
 * ends mid-line — a stack of identical full-width bars reads as a table, not
 * as text.
 */
export function SkeletonParagraph({ lines = 3 }: { lines?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-3"
          style={{ width: i === lines - 1 ? '55%' : '100%' }}
        />
      ))}
    </div>
  )
}

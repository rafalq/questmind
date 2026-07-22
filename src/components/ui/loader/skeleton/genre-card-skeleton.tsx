import { Skeleton, SkeletonText } from './skeleton'

/**
 * Placeholder for one GenreCard. Campaign cards and character cards are the
 * same component with different slots filled, so they share one skeleton
 * rather than drifting apart as either card changes.
 *
 * The dimensions are copied from GenreCard itself — border, p-4 sm:p-6, the
 * meta row, the title row, and an actions block pinned to the bottom with
 * mt-auto. Getting these wrong is worse than showing nothing: a skeleton that
 * is the wrong height makes the page jump when the real cards arrive, which is
 * the exact problem it exists to prevent.
 */
export default function GenreCardSkeleton() {
  return (
    <div className="flex h-full min-h-52 flex-col gap-2 border border-border bg-bg-surface p-4 sm:p-6">
      {/* Meta row: genre label left, badge and date right */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-3 w-14" />
      </div>

      {/* Title row with avatar slot */}
      <div className="flex items-start justify-between gap-3">
        <SkeletonText width="w-2/3" />
        <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
      </div>

      {/* Subtitle */}
      <Skeleton className="h-3 w-1/2" />

      {/* Actions, bottom-aligned exactly as GenreCard does it */}
      <div className="mt-auto pt-3">
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  )
}

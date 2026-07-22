import GenreCardSkeleton from '@/components/ui/loader/skeleton/genre-card-skeleton'
import { Skeleton } from '@/components/ui/loader/skeleton/skeleton'

/**
 * Suspense fallback for CampaignListServer.
 *
 * Replaces the plain "Loading campaigns..." line. That text was a single row
 * where a three-column grid was about to appear, so the section grew by
 * several hundred pixels the moment the query resolved and pushed the whole
 * Characters section down the page.
 *
 * Three cards is a guess at the common case, not a promise. A fallback cannot
 * know the real count — the point is to reserve a plausible block of the right
 * shape, not to predict it.
 */
export default function CampaignListSkeleton() {
  return (
    <>
      {/* Filter row: search + genre select, matching CampaignListClient */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-full sm:w-32" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <GenreCardSkeleton key={i} />
        ))}
      </div>
    </>
  )
}

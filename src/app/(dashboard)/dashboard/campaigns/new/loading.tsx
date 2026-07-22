import { Skeleton } from '@/components/ui/loader/skeleton/skeleton'

/**
 * The New Campaign page calls await connection(), which makes it dynamic: it
 * cannot be served from the static shell, so clicking "+ New Campaign" holds
 * the dashboard until the server responds. This gives the click something to
 * land on.
 *
 * Only the form is a placeholder. The heading and subheading are fixed strings
 * that cost nothing to render, so they are printed for real — a skeleton bar
 * standing in for text the app already knows is a worse experience than the
 * text.
 */
export default function NewCampaignLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-8">
      <h1 className="mb-2 text-3xl font-bold text-text-primary">
        New Campaign
      </h1>
      <p className="mb-10 text-text-secondary">
        Set the stage for your adventure.
      </p>

      <div className="flex flex-col gap-6" role="status" aria-busy="true">
        {/* Campaign name field */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-10 w-full" />
        </div>

        {/* Genre picker */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-20" />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>

        {/* Submit */}
        <Skeleton className="h-10 w-full sm:w-40" />
        <span className="sr-only">Loading the campaign form…</span>
      </div>
    </div>
  )
}

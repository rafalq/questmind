import GenreCardSkeleton from '@/components/ui/loader/skeleton/genre-card-skeleton'

/**
 * Suspense fallback for CharacterList. Same grid breakpoints as the list
 * itself (1 / sm:2 / lg:3) — a fallback on different breakpoints reflows at
 * different widths than the content it stands in for, which is a layout shift
 * with extra steps.
 */
export default function CharacterListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <GenreCardSkeleton key={i} />
      ))}
    </div>
  )
}

import {
  Skeleton,
  SkeletonButton,
  SkeletonInput,
  SkeletonText,
} from './skeleton'

/**
 * Stands in for the Clerk widget while it loads.
 *
 * Two things were wrong here. w-96 is 384px, which overflows a 360px viewport
 * — the width NFR-004 names as the floor — so the sign-in page could be
 * scrolled sideways before the form had even appeared. And bg-white is a fixed
 * colour: on the dark theme this was a white card that flashed and then turned
 * dark once Clerk mounted.
 *
 * w-full with a max-width and the surface token fixes both.
 */
export default function AuthSkeleton() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4 border border-border bg-bg-surface p-6 shadow-md sm:p-8">
      <SkeletonText width="w-48 mx-auto" />
      <SkeletonText width="w-64 max-w-full mx-auto" />
      <div className="mt-4 flex flex-col gap-3">
        <SkeletonInput />
        <SkeletonInput />
        <SkeletonButton />
      </div>
      <Skeleton className="mt-2 h-px w-full" />
      <SkeletonText width="w-40 mx-auto" />
    </div>
  )
}

import { clsx } from 'clsx'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={clsx('animate-pulse rounded-md bg-gray-300/40', className)}
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
  return <Skeleton className={clsx('h-32 w-full rounded-xl', className)} />
}

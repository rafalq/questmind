import {
  Skeleton,
  SkeletonButton,
  SkeletonInput,
  SkeletonText,
} from './skeleton'

export default function AuthSkeleton() {
  return (
    <div className="w-96 rounded-xl bg-white p-8 flex flex-col gap-4 shadow-md">
      <SkeletonText width="w-48 mx-auto" />
      <SkeletonText width="w-64 mx-auto" />
      <div className="flex flex-col gap-3 mt-4">
        <SkeletonInput />
        <SkeletonInput />
        <SkeletonButton />
      </div>
      <Skeleton className="h-px w-full mt-2" />
      <SkeletonText width="w-40 mx-auto" />
    </div>
  )
}

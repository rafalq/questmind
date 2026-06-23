import AuthSkeleton from '@/components/ui/loader/skeleton/auth-skeleton'
import { SignIn } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<AuthSkeleton />}>
        <SignIn forceRedirectUrl="/dashboard" />
      </Suspense>
    </div>
  )
}

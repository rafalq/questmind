import AuthSkeleton from '@/components/ui/loader/skeleton/auth-skeleton'
import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<AuthSkeleton />}>
        <SignUp forceRedirectUrl="/dashboard" />
      </Suspense>
    </div>
  )
}

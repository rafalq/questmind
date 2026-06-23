import Spinner from '@/components/ui/spinner'
import { SignIn } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<Spinner size="xl" />}>
        <SignIn forceRedirectUrl="/dashboard" />
      </Suspense>
    </div>
  )
}

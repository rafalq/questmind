import Spinner from '@/components/ui/spinner'
import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<Spinner size="xl" />}>
        <SignUp forceRedirectUrl="/dashboard" />
      </Suspense>
    </div>
  )
}

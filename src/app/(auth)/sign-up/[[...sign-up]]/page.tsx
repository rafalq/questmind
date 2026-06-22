import { SignUp } from '@clerk/nextjs'
import { Suspense } from 'react'

export default function SignUpPage() {
  return (
    <div className="flex w-full min-h-screen items-center justify-center">
      <Suspense>
        <SignUp forceRedirectUrl="/dashboard" />
      </Suspense>
    </div>
  )
}

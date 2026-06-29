import AuthSkeleton from '@/components/ui/loader/skeleton/auth-skeleton'
import { ROUTES } from '@/constants/routes'
import { SignUp } from '@clerk/nextjs'
import { connection } from 'next/server'
import { Suspense } from 'react'

export default async function SignUpPage() {
  await connection()

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Suspense fallback={<AuthSkeleton />}>
        <SignUp forceRedirectUrl={ROUTES.dashboard} />
      </Suspense>
    </div>
  )
}

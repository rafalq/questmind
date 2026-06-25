import { connection } from 'next/server'
import { Suspense } from 'react'

async function DynamicLayout({ children }: { children: React.ReactNode }) {
  await connection()
  return <>{children}</>
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={null}>
      <DynamicLayout>{children}</DynamicLayout>
    </Suspense>
  )
}

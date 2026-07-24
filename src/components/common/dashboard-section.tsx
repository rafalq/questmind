import ButtonLink from '@/components/ui/button-link'
import type { ReactNode } from 'react'

// The dashboard is two of these: a titled band with a primary action on the
// right and a Suspense-wrapped list underneath. Both were written out in full.
//
// `as` exists because both bands used to be <h1>. Two h1s on one page is not
// a style question - it leaves the document with no single top-level heading,
// which is what a screen reader's heading list is built from.
const HEADING_CLASS = 'text-2xl font-bold text-text-primary sm:text-3xl'

type Props = {
  title: string
  description: string
  action?: { href: string; label: string }
  as?: 'h1' | 'h2'
  children: ReactNode
}

export default function DashboardSection({
  title,
  description,
  action,
  as = 'h2',
  children,
}: Props) {
  const Heading = as

  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Heading className={HEADING_CLASS}>{title}</Heading>
          <p className="mt-1 text-text-secondary">{description}</p>
        </div>
        {action && (
          <div className="shrink-0">
            <ButtonLink href={action.href}>{action.label}</ButtonLink>
          </div>
        )}
      </div>
      {children}
    </section>
  )
}

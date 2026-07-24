import { ROUTES } from '@/constants/routes'
import Link from 'next/link'

// The closing band on every marketing page. Previously written out three
// times, and the three copies had drifted apart in ways nobody chose: one
// heading carried `text-text-primary` and the others did not, one lede used
// `text-text-muted` where the others used `text-text-secondary`, and only one
// of the three buttons had a visible focus ring.
//
// The focus ring is kept for all three. Losing it on two thirds of the site's
// primary actions was a keyboard-accessibility regression, not a design
// choice.

type Props = {
  heading: string
  description?: string
  ctaLabel: string
  /** Defaults to sign-up; every current caller wants exactly that. */
  href?: string
}

export default function CtaSection({
  heading,
  description,
  ctaLabel,
  href = ROUTES.signUp,
}: Props) {
  return (
    <section className="border-t border-border px-4 py-16 text-center sm:px-8 sm:py-20">
      <h2 className="mb-4 text-2xl font-bold tracking-wide text-text-primary sm:text-3xl md:text-4xl">
        {heading}
      </h2>
      {description && (
        <p className="font-(family-name:--font-im-fell) mb-8 text-base italic text-text-secondary sm:text-lg">
          {description}
        </p>
      )}
      <Link
        href={href}
        className="inline-block w-full max-w-xs bg-accent px-10 py-4 text-sm font-bold tracking-widest text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto sm:max-w-none"
      >
        {ctaLabel}
      </Link>
    </section>
  )
}

import type { ReactNode } from 'react'
import SectionEyebrow from './section-eyebrow'

// eyebrow + heading + optional lede, centred. Every marketing section on the
// site opens with this shape.
//
// `as` is not styling sugar: a page's own header is an h1 and the sections
// below it are h2s, and the two need different type scales. Passing the level
// keeps the document outline correct without each caller restating the scale.
const HEADING_CLASS = {
  h1: 'mx-auto max-w-3xl text-3xl font-bold leading-tight tracking-wide sm:text-4xl md:text-5xl',
  h2: 'text-2xl font-bold tracking-wide text-text-primary md:text-3xl',
} as const

type Props = {
  eyebrow: string
  heading: ReactNode
  description?: ReactNode
  as?: keyof typeof HEADING_CLASS
  /** Spacing only — the section decides how far it sits from its content. */
  className?: string
}

export default function SectionHeader({
  eyebrow,
  heading,
  description,
  as = 'h2',
  className = '',
}: Props) {
  const Heading = as

  return (
    <div className={`text-center ${className}`}>
      <SectionEyebrow className={as === 'h1' ? 'mb-4' : 'mb-3'}>
        {eyebrow}
      </SectionEyebrow>
      <Heading
        className={`${HEADING_CLASS[as]} ${description ? 'mb-6' : ''}`.trim()}
      >
        {heading}
      </Heading>
      {description && (
        <p className="font-(family-name:--font-im-fell) mx-auto max-w-2xl text-base italic leading-relaxed text-text-secondary sm:text-lg">
          {description}
        </p>
      )}
    </div>
  )
}

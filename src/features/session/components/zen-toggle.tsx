'use client'

import { IconArrowsMaximize, IconArrowsMinimize } from '@tabler/icons-react'

type Props = {
  isZen: boolean
  onToggle: () => void
  /** "header" = inline enter trigger; "floating" = fixed exit control in zen. */
  variant?: 'header' | 'floating'
  className?: string
}

export default function ZenToggle({
  isZen,
  onToggle,
  variant = 'header',
  className = '',
}: Props) {
  const label = isZen ? 'Exit zen mode' : 'Zen mode (distraction-free)'
  const Icon = isZen ? IconArrowsMinimize : IconArrowsMaximize

  const base =
    'shrink-0 transition text-text-muted hover:text-accent ' +
    'focus-visible:outline-none focus-visible:text-accent'

  const byVariant =
    variant === 'floating'
      ? 'fixed right-4 top-4 z-[70] rounded-md p-2 bg-bg-surface/70 backdrop-blur ' +
        'opacity-50 hover:opacity-100 focus-visible:opacity-100'
      : 'p-1.5'

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      title={label}
      className={`${base} ${byVariant} ${className}`.trim()}
    >
      <Icon size={variant === 'floating' ? 22 : 20} aria-hidden />
    </button>
  )
}

// steps/modifier-badge.tsx
import { getAttributeLabel } from '@/worlds'

/**
 * Shared attribute-modifier chip used by the Race, Sex and Class steps.
 * `world` is required because the attribute display names are world-specific
 * ('strength' is Brawn in The Drift, Body in Neon Warszawa) — printing the
 * raw key here would contradict the Attributes and Summary steps.
 */
export default function ModifierBadge({
  attr,
  val,
  world,
}: {
  attr: string
  val: number
  world: string
}) {
  const isPositive = val > 0

  return (
    // Filled rather than outlined. As an outline it was a mid-green on a pale
    // background — around 3:1, under AA — and each theme would have needed its
    // own text colour. A background/foreground token pair solves both: the
    // fill carries the meaning, and --qm-*-fg is already defined per theme, so
    // the label stays legible in dark and light without a conditional here.
    <span
      className={`whitespace-nowrap px-2 py-0.5 text-xs font-medium ${
        isPositive
          ? 'bg-positive text-positive-fg'
          : 'bg-negative text-negative-fg'
      }`}
    >
      {isPositive ? '+' : ''}
      {val} {getAttributeLabel(world, attr)}
    </span>
  )
}

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
  return (
    <span
      className={`text-xs px-2 py-0.5 border whitespace-nowrap ${
        val > 0
          ? 'border-emerald-700 text-emerald-500'
          : 'border-red-800 text-red-500'
      }`}
    >
      {val > 0 ? '+' : ''}
      {val} {getAttributeLabel(world, attr)}
    </span>
  )
}

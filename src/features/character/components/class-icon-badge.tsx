import { TREIGTHE_CLASS_ICONS } from '@/features/character/constants/fantasy/treigthe'
import type { CharacterClass } from '@/features/character/constants'

export default function ClassIconBadge({
  characterClass,
  size = 64,
}: {
  characterClass: CharacterClass
  size?: number
}) {
  const Icon = TREIGTHE_CLASS_ICONS[characterClass]

  return (
    <div
      className="rounded-full border border-border bg-surface flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.5} className="text-text-secondary" stroke={1.5} />
    </div>
  )
}

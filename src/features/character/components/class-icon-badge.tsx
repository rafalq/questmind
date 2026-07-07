import { TREIGTHE_CLASS_ICONS } from '@/features/character/constants/fantasy/treigthe'
import { IconHelp } from '@tabler/icons-react'

// Widened view over the per-world icon maps. Add future worlds by
// spreading their maps here (e.g. ...DRIFT_CLASS_ICONS); IconHelp
// covers classes that don't have an icon yet.
const CLASS_ICONS: Record<string, typeof IconHelp> = {
  ...TREIGTHE_CLASS_ICONS,
}

export default function ClassIconBadge({
  characterClass,
  size = 64,
}: {
  characterClass: string
  size?: number
}) {
  const Icon = CLASS_ICONS[characterClass] ?? IconHelp

  return (
    <div
      className="rounded-full border border-border bg-surface flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <Icon size={size * 0.5} className="text-text-secondary" stroke={1.5} />
    </div>
  )
}

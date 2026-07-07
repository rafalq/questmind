import { getWorld } from '@/worlds'
import ClassCard from './class-card'
import type { FormData } from '@/features/character/types/wizard-types'

export default function StepClass({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  if (!data.world || !data.race) return null

  // Consts keep the narrowed types inside the map callback below
  const world = data.world
  const race = data.race
  const classes = getWorld(world).classes

  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-sm">
        Choose your class. This defines your role and grants additional
        modifiers.
      </p>
      {classes.map((cls) => (
        <ClassCard
          key={cls.value}
          cls={cls}
          world={world}
          race={race}
          gender={data.gender}
          selected={data.characterClass === cls.value}
          onSelect={() => onChange({ characterClass: cls.value })}
        />
      ))}
    </div>
  )
}

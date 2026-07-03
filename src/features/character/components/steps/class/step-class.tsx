import { CLASSES_BY_WORLD } from '@/features/character/constants'
import ClassCard from './class-card'
import type { FormData } from '@/features/character/types/wizard-types'
import type { CharacterClass } from '@/features/character/constants'

export default function StepClass({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  if (!data.world || !data.race) return null
  const classes = CLASSES_BY_WORLD[data.world]

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
          race={data.race!}
          gender={data.gender}
          selected={data.characterClass === cls.value}
          onSelect={() =>
            onChange({ characterClass: cls.value as CharacterClass })
          }
        />
      ))}
    </div>
  )
}

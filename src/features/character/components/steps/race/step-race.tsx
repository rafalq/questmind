import { RACES_BY_WORLD } from '@/features/character/constants'
import RaceCard from './race-card'
import type { FormData } from '../../../types/wizard-types'

export default function StepRace({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  if (!data.world) return null
  const races = RACES_BY_WORLD[data.world]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-sm">
        Choose your character&apos;s origin. Each race grants attribute
        modifiers.
      </p>
      {races.map((race) => (
        <RaceCard
          key={race.value}
          race={race}
          selected={data.race === race.value}
          onSelect={() =>
            onChange({
              race: race.value,
              gender: race.genderless ? null : data.gender,
            })
          }
        />
      ))}
    </div>
  )
}

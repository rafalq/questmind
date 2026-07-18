import { getWorld } from '@/worlds'
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
  // Hoisted so the narrowing survives into the map callback below —
  // same pattern as step-class.tsx.
  const world = data.world
  const races = getWorld(world).races

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
          world={world}
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

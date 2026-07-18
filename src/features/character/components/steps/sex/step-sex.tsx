import { getWorld } from '@/worlds'
import ModifierBadge from '@/features/character/components/steps/modifier-badge'
import type { FormData } from '../../../types/wizard-types'

export default function StepSex({
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
  const options = getWorld(world).genderOptions

  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-sm">
        Choose your character&apos;s sex. This grants a small attribute
        modifier.
      </p>
      {options.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChange({ gender: option.id })}
          className={`text-left border px-5 py-4 transition-colors ${
            data.gender === option.id
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-text-muted'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <p
              className={`font-semibold ${data.gender === option.id ? 'text-accent' : 'text-text-primary'}`}
            >
              {option.label}
            </p>
            <div className="flex flex-col gap-1 shrink-0">
              {Object.entries(option.statModifiers).map(([attr, val]) => (
                <ModifierBadge
                  key={attr}
                  attr={attr}
                  val={val ?? 0}
                  world={world}
                />
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

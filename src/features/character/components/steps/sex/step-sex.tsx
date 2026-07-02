import { WORLD_GENDER_OPTIONS } from '@/features/character/constants'
import type { FormData } from '../../../types/wizard-types'

function ModifierBadge({ attr, val }: { attr: string; val: number }) {
  return (
    <span
      className={`text-xs px-2 py-0.5 border whitespace-nowrap ${
        val > 0
          ? 'border-emerald-700 text-emerald-500'
          : 'border-red-800 text-red-500'
      }`}
    >
      {val > 0 ? '+' : ''}
      {val} {attr}
    </span>
  )
}

export default function StepSex({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  if (!data.world) return null
  const options = WORLD_GENDER_OPTIONS[data.world]

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
                <ModifierBadge key={attr} attr={attr} val={val ?? 0} />
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

import { RACES_BY_GENRE } from '@/features/character/constants'
import type { FormData } from '../types/wizard-types'

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

export default function StepRace({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  if (!data.genre) return null
  const races = RACES_BY_GENRE[data.genre]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-sm">
        Choose your character&apos;s origin. Each race grants attribute
        modifiers.
      </p>
      {races.map((race) => (
        <button
          key={race.value}
          type="button"
          onClick={() => onChange({ race: race.value })}
          className={`text-left border px-5 py-4 transition-colors ${
            data.race === race.value
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-text-muted'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className={`font-semibold ${data.race === race.value ? 'text-accent' : 'text-text-primary'}`}
              >
                {race.label}
              </p>
              <p className="text-text-muted text-sm mt-1">{race.description}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              {Object.entries(race.modifiers).map(([attr, val]) => (
                <ModifierBadge key={attr} attr={attr} val={val ?? 0} />
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

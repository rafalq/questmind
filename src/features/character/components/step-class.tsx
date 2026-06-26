import { CLASSES_BY_GENRE } from '@/features/character/constants'
import type { CharacterClass } from '@/features/character/constants'
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

export default function StepClass({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  if (!data.genre) return null
  const classes = CLASSES_BY_GENRE[data.genre]

  return (
    <div className="flex flex-col gap-4">
      <p className="text-text-muted text-sm">
        Choose your class. This defines your role and grants additional
        modifiers.
      </p>
      {classes.map((cls) => (
        <button
          key={cls.value}
          type="button"
          onClick={() =>
            onChange({ characterClass: cls.value as CharacterClass })
          }
          className={`text-left border px-5 py-4 transition-colors ${
            data.characterClass === cls.value
              ? 'border-accent bg-accent/5'
              : 'border-border hover:border-text-muted'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p
                className={`font-semibold ${data.characterClass === cls.value ? 'text-accent' : 'text-text-primary'}`}
              >
                {cls.label}
              </p>
              <p className="text-text-muted text-sm mt-1">{cls.description}</p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              {Object.entries(cls.modifiers).map(([attr, val]) => (
                <ModifierBadge key={attr} attr={attr} val={val ?? 0} />
              ))}
            </div>
          </div>
        </button>
      ))}
    </div>
  )
}

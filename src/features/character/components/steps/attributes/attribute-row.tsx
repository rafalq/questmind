// steps/attributes/attribute-row.tsx
import type { Attribute } from '@/features/character/constants'

export default function AttributeRow({
  attr,
  label,
  value,
  raceMod,
  classMod,
  genderMod,
  total,
  min,
  max,
  remaining,
  onChange,
}: {
  attr: Attribute
  label: string
  value: number
  raceMod: number
  classMod: number
  genderMod: number
  total: number
  min: number
  max: number
  remaining: number
  onChange: (delta: number) => void
}) {
  return (
    <div className="flex items-center gap-4 border border-border px-4 py-3">
      <div className="w-32 shrink-0">
        <p className="text-text-primary text-sm font-medium">{label}</p>
        {(raceMod !== 0 || classMod !== 0 || genderMod !== 0) && (
          <p className="text-xs text-text-muted mt-0.5 flex flex-wrap gap-x-1">
            {raceMod !== 0 && (
              <span
                className={raceMod > 0 ? 'text-emerald-500' : 'text-red-500'}
              >
                {raceMod > 0 ? '+' : ''}
                {raceMod} race
              </span>
            )}
            {classMod !== 0 && (
              <span
                className={classMod > 0 ? 'text-emerald-500' : 'text-red-500'}
              >
                {classMod > 0 ? '+' : ''}
                {classMod} class
              </span>
            )}
            {genderMod !== 0 && (
              <span
                className={genderMod > 0 ? 'text-emerald-500' : 'text-red-500'}
              >
                {genderMod > 0 ? '+' : ''}
                {genderMod} sex
              </span>
            )}
          </p>
        )}
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button
          type="button"
          onClick={() => onChange(-1)}
          disabled={value <= min}
          className="w-7 h-7 border border-border text-text-secondary hover:border-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          −
        </button>
        <span className="w-6 text-center text-text-primary font-semibold">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(1)}
          disabled={value >= max || remaining <= 0}
          className="w-7 h-7 border border-border text-text-secondary hover:border-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          +
        </button>
        <span className="w-8 text-right text-accent font-bold text-sm">
          {total}
        </span>
      </div>
    </div>
  )
}

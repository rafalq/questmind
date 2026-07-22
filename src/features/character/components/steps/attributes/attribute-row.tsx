// steps/attributes/attribute-row.tsx
import type { Attribute } from '@/features/character/constants'

export default function AttributeRow({
  attr,
  label,
  description,
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
  /** World-specific one-liner. Optional so a world without descriptions
   *  simply renders the old two-line row instead of an empty node. */
  description?: string
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
    <div className="flex items-start gap-4 border border-border px-4 py-3">
      {/* Was w-32 shrink-0 — the fixed 8rem column cannot hold a sentence,
          so the text side now grows and the controls hold their width. */}
      <div className="min-w-0 flex-1">
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
        {description && (
          <p
            id={`attr-${attr}-description`}
            className="text-xs text-text-muted mt-1.5 max-w-[60ch] leading-relaxed"
          >
            {description}
          </p>
        )}
      </div>

      {/* shrink-0 so the stepper never compresses when a long description
          fights it for space; pt-0.5 keeps it optically level with the label. */}
      <div className="flex items-center gap-3 shrink-0 pt-0.5">
        <button
          type="button"
          onClick={() => onChange(-1)}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          aria-describedby={
            description ? `attr-${attr}-description` : undefined
          }
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
          aria-label={`Increase ${label}`}
          aria-describedby={
            description ? `attr-${attr}-description` : undefined
          }
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

import {
  RACES_BY_GENRE,
  CLASSES_BY_GENRE,
  ATTRIBUTE_LABELS,
  POINT_BUY_TOTAL,
  ATTRIBUTE_MIN,
  ATTRIBUTE_MAX,
  calculateAttributeTotal,
  calculateMaxHp,
  type Attribute,
} from '@/features/character/constants'
import { ATTRIBUTES, type FormData } from '../types/wizard-types'

export default function StepAttributes({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  if (!data.genre || !data.race || !data.characterClass) return null

  const raceDef = RACES_BY_GENRE[data.genre].find((r) => r.value === data.race)
  const classDef = CLASSES_BY_GENRE[data.genre].find(
    (c) => c.value === data.characterClass
  )
  const labels = ATTRIBUTE_LABELS[data.genre]

  const totalSpent = Object.values(data.attributes).reduce((s, v) => s + v, 0)
  const remaining = POINT_BUY_TOTAL - totalSpent

  const enduranceTotal = calculateAttributeTotal(
    data.attributes.endurance,
    raceDef?.modifiers.endurance ?? 0,
    classDef?.modifiers.endurance ?? 0
  )
  const maxHp = calculateMaxHp(enduranceTotal)

  const handleChange = (attr: Attribute, delta: number) => {
    const current = data.attributes[attr]
    const next = current + delta
    if (next < ATTRIBUTE_MIN || next > ATTRIBUTE_MAX) return
    if (delta > 0 && remaining <= 0) return
    onChange({ attributes: { ...data.attributes, [attr]: next } })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-text-muted text-sm">
          Distribute{' '}
          <span className="text-text-primary font-semibold">
            {POINT_BUY_TOTAL}
          </span>{' '}
          points across attributes.
        </p>
        <span
          className={`text-sm font-semibold px-3 py-1 border ${
            remaining === 0
              ? 'border-accent text-accent'
              : remaining < 0
                ? 'border-red-700 text-red-500'
                : 'border-border text-text-secondary'
          }`}
        >
          {remaining} left
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {ATTRIBUTES.map((attr) => {
          const raceMod = raceDef?.modifiers[attr] ?? 0
          const classMod = classDef?.modifiers[attr] ?? 0
          const total = calculateAttributeTotal(
            data.attributes[attr],
            raceMod,
            classMod
          )

          return (
            <div
              key={attr}
              className="flex items-center gap-4 border border-border px-4 py-3"
            >
              <div className="w-32 shrink-0">
                <p className="text-text-primary text-sm font-medium">
                  {labels[attr]}
                </p>
                {(raceMod !== 0 || classMod !== 0) && (
                  <p className="text-xs text-text-muted mt-0.5">
                    {raceMod !== 0 && (
                      <span
                        className={
                          raceMod > 0 ? 'text-emerald-500' : 'text-red-500'
                        }
                      >
                        {raceMod > 0 ? '+' : ''}
                        {raceMod} race
                      </span>
                    )}
                    {raceMod !== 0 && classMod !== 0 && ' · '}
                    {classMod !== 0 && (
                      <span
                        className={
                          classMod > 0 ? 'text-emerald-500' : 'text-red-500'
                        }
                      >
                        {classMod > 0 ? '+' : ''}
                        {classMod} class
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => handleChange(attr, -1)}
                  disabled={data.attributes[attr] <= ATTRIBUTE_MIN}
                  className="w-7 h-7 border border-border text-text-secondary hover:border-text-muted hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  −
                </button>
                <span className="w-6 text-center text-text-primary font-semibold">
                  {data.attributes[attr]}
                </span>
                <button
                  type="button"
                  onClick={() => handleChange(attr, 1)}
                  disabled={
                    data.attributes[attr] >= ATTRIBUTE_MAX || remaining <= 0
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
        })}
      </div>

      <div className="border border-border px-5 py-3 flex items-center justify-between">
        <span className="text-text-secondary text-sm">Max HP</span>
        <span className="text-accent font-bold text-lg">{maxHp}</span>
      </div>
    </div>
  )
}

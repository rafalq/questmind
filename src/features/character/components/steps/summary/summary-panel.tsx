// steps/summary/summary-panel.tsx
import {
  ATTRIBUTES,
  type FormData,
} from '@/features/character/types/wizard-types'
import {
  calculateAttributeTotal,
  calculateMaxHp,
} from '@/features/character/constants'
import type {
  RaceDefinition,
  ClassDefinition,
} from '@/features/character/constants'

export default function SummaryPanel({
  data,
  raceDef,
  classDef,
  genderLabel,
  labels,
}: {
  data: FormData
  raceDef?: RaceDefinition
  classDef?: ClassDefinition
  genderLabel: string | null
  labels: Record<string, string>
}) {
  const raceMods = raceDef?.modifiers ?? {}
  const classMods = classDef?.modifiers ?? {}

  const enduranceTotal = calculateAttributeTotal(
    data.attributes.endurance,
    raceMods.endurance ?? 0,
    classMods.endurance ?? 0
  )

  return (
    <div className="border border-border p-5">
      <p className="text-xs uppercase tracking-widest text-text-muted mb-4">
        Summary
      </p>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <span className="text-text-secondary text-sm">Name</span>
          <span className="text-text-primary text-sm font-medium">
            {data.name}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-secondary text-sm">Race</span>
          <span className="text-text-primary text-sm">{raceDef?.label}</span>
        </div>
        {genderLabel && (
          <div className="flex justify-between">
            <span className="text-text-secondary text-sm">Sex</span>
            <span className="text-text-primary text-sm">{genderLabel}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-text-secondary text-sm">Class</span>
          <span className="text-text-primary text-sm">{classDef?.label}</span>
        </div>
        <div className="border-t border-border mt-2 pt-2 flex flex-col gap-1">
          {ATTRIBUTES.map((attr) => {
            const total = calculateAttributeTotal(
              data.attributes[attr],
              raceMods[attr] ?? 0,
              classMods[attr] ?? 0
            )
            return (
              <div key={attr} className="flex justify-between">
                <span className="text-text-muted text-xs">{labels[attr]}</span>
                <span className="text-accent text-xs font-semibold">
                  {total}
                </span>
              </div>
            )
          })}
          <div className="flex justify-between mt-1 pt-1 border-t border-border">
            <span className="text-text-muted text-xs">Max HP</span>
            <span className="text-accent text-xs font-semibold">
              {calculateMaxHp(enduranceTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// steps/attributes/step-attributes.tsx
import {
  POINT_BUY_TOTAL,
  ATTRIBUTE_MIN,
  ATTRIBUTE_MAX,
  calculateAttributeTotal,
  calculateMaxHp,
  type Attribute,
} from '@/features/character/constants'
import { getWorld } from '@/worlds'
import {
  ATTRIBUTES,
  type FormData,
} from '@/features/character/types/wizard-types'
import PointsRemainingBadge from './points-remaining-badge'
import AttributeRow from './attribute-row'
import HpSummary from './hp-summary'

export default function StepAttributes({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  if (!data.world || !data.race || !data.characterClass) return null

  const world = getWorld(data.world)
  const raceDef = world.races.find((r) => r.value === data.race)
  const classDef = world.classes.find((c) => c.value === data.characterClass)
  const genderDef = data.gender
    ? world.genderOptions.find((g) => g.id === data.gender)
    : null
  const labels = world.attributeLabels
  // Optional: a world may not have descriptions yet, in which case the rows
  // simply render as before.
  const descriptions = world.attributeDescriptions

  const totalSpent = Object.values(data.attributes).reduce((s, v) => s + v, 0)
  const remaining = POINT_BUY_TOTAL - totalSpent

  const enduranceTotal = calculateAttributeTotal(
    data.attributes.endurance,
    (raceDef?.modifiers.endurance ?? 0) +
      (genderDef?.statModifiers.endurance ?? 0),
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
        <PointsRemainingBadge remaining={remaining} />
      </div>

      <div className="flex flex-col gap-3">
        {ATTRIBUTES.map((attr) => {
          const raceMod = raceDef?.modifiers[attr] ?? 0
          const classMod = classDef?.modifiers[attr] ?? 0
          const genderMod = genderDef?.statModifiers[attr] ?? 0
          const total = calculateAttributeTotal(
            data.attributes[attr],
            raceMod + genderMod,
            classMod
          )

          return (
            <AttributeRow
              key={attr}
              attr={attr}
              label={labels[attr]}
              description={descriptions?.[attr]}
              value={data.attributes[attr]}
              raceMod={raceMod}
              classMod={classMod}
              genderMod={genderMod}
              total={total}
              min={ATTRIBUTE_MIN}
              max={ATTRIBUTE_MAX}
              remaining={remaining}
              onChange={(delta) => handleChange(attr, delta)}
            />
          )
        })}
      </div>

      <HpSummary maxHp={maxHp} />
    </div>
  )
}

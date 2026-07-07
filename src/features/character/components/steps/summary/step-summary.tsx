import {
  RACES_BY_WORLD,
  CLASSES_BY_WORLD,
  ATTRIBUTE_LABELS_BY_WORLD,
  WORLD_GENDER_OPTIONS,
} from '@/features/character/constants'
import type { FormData } from '@/features/character/types/wizard-types'
import NameInput from './name-input'
import CharacterPortrait from '@/features/character/components/steps/class-portrait'
import SummaryPanel from './summary-panel'

export default function StepSummary({
  data,
  onChange,
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
}) {
  if (!data.world || !data.race || !data.characterClass) return null

  const raceDef = RACES_BY_WORLD[data.world].find((r) => r.value === data.race)
  const classDef = CLASSES_BY_WORLD[data.world].find(
    (c) => c.value === data.characterClass
  )
  const genderDef = data.gender
    ? WORLD_GENDER_OPTIONS[data.world].find((g) => g.id === data.gender)
    : null
  const labels = ATTRIBUTE_LABELS_BY_WORLD[data.world]

  return (
    <div className="flex flex-col gap-6">
      <CharacterPortrait
        race={data.race}
        gender={data.gender}
        characterClass={data.characterClass}
      />
      <NameInput value={data.name} onChange={(name) => onChange({ name })} />
      <SummaryPanel
        data={data}
        raceDef={raceDef}
        classDef={classDef}
        genderLabel={genderDef?.label ?? null}
        labels={labels}
      />
    </div>
  )
}

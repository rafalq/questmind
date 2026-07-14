import { getWorld } from '@/worlds'
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

  const world = getWorld(data.world)

  const raceDef = world.races.find((r) => r.value === data.race)
  const classDef = world.classes.find((c) => c.value === data.characterClass)
  const genderDef = data.gender
    ? world.genderOptions.find((g) => g.id === data.gender)
    : null
  const labels = world.attributeLabels

  return (
    <div className="flex flex-col gap-6">
      <CharacterPortrait
        world={data.world}
        race={data.race}
        gender={data.gender}
        characterClass={data.characterClass}
      />
      <NameInput value={data.name} onChange={(name) => onChange({ name })} />
      <SummaryPanel
        data={data}
        world={data.world}
        raceDef={raceDef}
        classDef={classDef}
        genderDef={genderDef}
        labels={labels}
      />
    </div>
  )
}

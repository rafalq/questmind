import {
  RACES_BY_GENRE,
  CLASSES_BY_GENRE,
  ATTRIBUTE_LABELS,
  calculateAttributeTotal,
  calculateMaxHp,
} from '@/features/character/constants'
import { ATTRIBUTES, type FormData } from '../types/wizard-types'

export default function StepStory({
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
  const raceMods = raceDef?.modifiers ?? {}
  const classMods = classDef?.modifiers ?? {}

  const enduranceTotal = calculateAttributeTotal(
    data.attributes.endurance,
    raceMods.endurance ?? 0,
    classMods.endurance ?? 0
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-sm text-text-secondary mb-2 tracking-wider uppercase">
          Background Story{' '}
          <span className="text-text-muted normal-case">(optional)</span>
        </label>
        <textarea
          value={data.backgroundStory}
          onChange={(e) => onChange({ backgroundStory: e.target.value })}
          placeholder="Who is your character? What drives them? What do they fear?"
          maxLength={1000}
          rows={5}
          className="w-full bg-transparent border border-border px-4 py-3 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors resize-none"
        />
        <p className="text-xs text-text-muted mt-1 text-right">
          {data.backgroundStory.length}/1000
        </p>
      </div>

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
            <span className="text-text-secondary text-sm">Genre</span>
            <span className="text-text-primary text-sm capitalize">
              {data.genre}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary text-sm">Race</span>
            <span className="text-text-primary text-sm">{raceDef?.label}</span>
          </div>
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
                  <span className="text-text-muted text-xs">
                    {labels[attr]}
                  </span>
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
    </div>
  )
}

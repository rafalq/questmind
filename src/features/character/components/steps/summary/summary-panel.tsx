// steps/summary/summary-panel.tsx
import type { FormData } from '@/features/character/types/wizard-types'
import { calculateAttributeTotal } from '@/features/character/constants'
import { calculateMaxHp } from '@/features/character/lib/hp'
import { resolveAbilities } from '@/features/character/lib/progression'
import { buildStartingInventory } from '@/worlds/starting-equipment'
import { buildInventoryDisplay } from '@/features/session/lib/inventory-display'
import type {
  Attribute,
  AttributeLabels,
  ClassDefinition,
  GenderOption,
  RaceDefinition,
} from '@/worlds/schema'
import { IconBolt } from '@tabler/icons-react'

export default function SummaryPanel({
  data,
  world,
  raceDef,
  classDef,
  genderDef,
  labels,
}: {
  data: FormData
  world: string
  raceDef?: RaceDefinition
  classDef?: ClassDefinition
  // The whole option, not just its label: gender carries stat modifiers that
  // create-character applies, and this panel used to omit them — so the summary
  // showed one set of numbers and the database stored another.
  genderDef?: GenderOption | null
  labels: AttributeLabels
}) {
  const raceMods = raceDef?.modifiers ?? {}
  const classMods = classDef?.modifiers ?? {}
  const genderMods = genderDef?.statModifiers ?? {}

  // Mirrors create-character exactly: race and gender modifiers are summed into
  // one term, class into the other. If these two ever drift apart, the wizard
  // lies to the player.
  const total = (attr: Attribute) =>
    calculateAttributeTotal(
      data.attributes[attr],
      (raceMods[attr] ?? 0) + (genderMods[attr] ?? 0),
      classMods[attr] ?? 0
    )

  const maxHp = calculateMaxHp(total('endurance'))

  // Race and class kits combined — the same call create-character makes, so this
  // is what the character will actually be carrying.
  const inventory =
    raceDef && classDef
      ? buildInventoryDisplay(
          buildStartingInventory(
            raceDef.startingEquipment,
            classDef.startingEquipment
          ),
          world
        )
      : []

  // Tier 1 only: this is what the character starts with, not what they will
  // eventually unlock. The full path is shown on the class card.
  const startingAbilities = classDef
    ? resolveAbilities(classDef.abilities, 1)
    : []

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
        {genderDef && (
          <div className="flex justify-between">
            <span className="text-text-secondary text-sm">Sex</span>
            <span className="text-text-primary text-sm">{genderDef.label}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-text-secondary text-sm">Class</span>
          <span className="text-text-primary text-sm">{classDef?.label}</span>
        </div>

        {/* Attributes */}
        <div className="border-t border-border mt-2 pt-2 flex flex-col gap-1">
          {(Object.keys(labels) as Attribute[]).map((attr) => {
            // The key attribute gates tier progression: worth flagging before
            // the player commits, since there is no respec.
            const isKey = attr === classDef?.keyAttribute

            return (
              <div key={attr} className="flex justify-between">
                <span
                  className={`text-xs ${
                    isKey ? 'text-accent' : 'text-text-muted'
                  }`}
                >
                  {labels[attr]}
                  {isKey && ' ★'}
                </span>
                <span className="text-accent text-xs font-semibold tabular-nums">
                  {total(attr)}
                </span>
              </div>
            )
          })}

          <div className="flex justify-between mt-1 pt-1 border-t border-border">
            <span className="text-text-muted text-xs">Max HP</span>
            <span className="text-accent text-xs font-semibold tabular-nums">
              {maxHp}
            </span>
          </div>
        </div>

        {/* Starting abilities */}
        {startingAbilities.length > 0 && (
          <div className="border-t border-border mt-2 pt-3">
            <p className="text-[10px] uppercase tracking-widest text-text-muted/60 mb-2">
              Starting abilities
            </p>
            <ul className="flex flex-col gap-2">
              {startingAbilities.map((ability) => (
                <li key={ability.value}>
                  <div className="flex items-baseline gap-1.5">
                    <IconBolt
                      size={12}
                      className="shrink-0 text-accent/60 translate-y-0.5"
                    />
                    <span className="text-text-secondary text-sm flex-1">
                      {ability.name}
                    </span>
                    {ability.cost?.kind === 'hp' && (
                      <span className="text-red-400/70 text-xs shrink-0">
                        {ability.cost.amount} HP
                      </span>
                    )}
                  </div>
                  <p className="text-text-muted text-xs leading-snug pl-4.5 mt-0.5">
                    {ability.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Starting inventory — race kit and class kit combined */}
        {inventory.length > 0 && (
          <div className="border-t border-border mt-2 pt-3">
            <p className="text-[10px] uppercase tracking-widest text-text-muted/60 mb-2">
              Starting inventory
            </p>
            <ul className="flex flex-col gap-0.5">
              {inventory.map((entry) => (
                <li
                  key={entry.name}
                  className="flex items-baseline justify-between text-sm"
                >
                  <span className="text-text-secondary">{entry.name}</span>
                  {entry.qty > 1 && (
                    <span className="text-text-muted text-xs tabular-nums">
                      ×{entry.qty}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

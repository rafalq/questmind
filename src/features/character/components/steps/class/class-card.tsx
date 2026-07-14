// steps/class/class-card.tsx
import ModifierBadge from '@/features/character/components/steps/modifier-badge'
import type { ClassDefinition } from '@/worlds'
import ClassPortrait from '../class-portrait'

export default function ClassCard({
  cls,
  world,
  race,
  gender,
  selected,
  onSelect,
}: {
  cls: ClassDefinition
  world: string
  race: string
  gender: string | null
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`text-left border px-5 py-4 transition-colors ${
        selected
          ? 'border-accent bg-accent/5'
          : 'border-border hover:border-text-muted'
      }`}
    >
      <ClassPortrait
        world={world}
        race={race}
        gender={gender}
        characterClass={cls.value}
      />

      <div className="flex flex-col gap-2 justify-center items-center">
        <p
          className={`font-semibold ${selected ? 'text-accent' : 'text-text-primary'}`}
        >
          {cls.label}
        </p>
        <p className="text-text-muted text-sm">{cls.description}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(cls.modifiers).map(([attr, val]) => (
            <ModifierBadge key={attr} attr={attr} val={val ?? 0} />
          ))}
        </div>
        {/* Abilities: names and tiers only. The player is comparing four
            classes here, not reading five paragraphs about each — the full
            descriptions live on the summary step and in the character sheet. */}
        {cls.abilities.length > 0 && (
          <div className="w-full mt-2 pt-2 border-t border-border/40">
            <p className="text-[10px] uppercase tracking-widest text-text-muted/60 text-center mb-2.5">
              Abilities
            </p>
            <ul className="flex flex-col items-center gap-0.5">
              {cls.abilities.map((a) => (
                <li
                  key={a.value}
                  className="flex items-baseline justify-center gap-2.5 text-xs"
                >
                  <span className="text-text-secondary">{a.name}</span>
                  <span className="text-text-muted/60 tabular-nums">
                    T{a.tier}
                    {a.cost?.kind === 'hp' && (
                      <span className="text-red-400/60 text-[10px] tabular-nums">
                        {' '}
                        · {a.cost.amount} HP
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
        {cls.startingEquipment.length > 0 && (
          <p className="text-text-muted/70 text-xs mt-2.5">
            Starts with:{' '}
            {cls.startingEquipment
              .map((i) => (i.qty > 1 ? `${i.name} ×${i.qty}` : i.name))
              .join(', ')}
          </p>
        )}
      </div>
    </button>
  )
}

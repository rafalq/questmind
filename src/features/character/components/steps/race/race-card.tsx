// steps/race/race-card.tsx — wersja bez portretów

import ModifierBadge from '@/features/character/components/steps/modifier-badge'
import type { RaceDefinition } from '@/features/character/constants'

export default function RaceCard({
  race,
  selected,
  onSelect,
}: {
  race: RaceDefinition
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <p
            className={`font-semibold ${selected ? 'text-accent' : 'text-text-primary'}`}
          >
            {race.label}
          </p>
          <p className="text-text-muted text-sm mt-1">{race.description}</p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {Object.entries(race.modifiers).map(([attr, val]) => (
            <ModifierBadge key={attr} attr={attr} val={val ?? 0} />
          ))}
        </div>
      </div>
    </button>
  )
}

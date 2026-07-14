import RacePortraits from './race-portraits'
import ModifierBadge from '@/features/character/components/steps/modifier-badge'
import type { RaceDefinition } from '@/worlds/schema'

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
      <RacePortraits race={race} />

      <div className="flex flex-col gap-2 justify-center items-center">
        <p
          className={`font-semibold ${selected ? 'text-accent' : 'text-text-primary'}`}
        >
          {race.label}
        </p>
        <p className="text-text-muted text-sm">{race.description}</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(race.modifiers).map(([attr, val]) => (
            <ModifierBadge key={attr} attr={attr} val={val ?? 0} />
          ))}
        </div>
        {race.startingEquipment.length > 0 && (
          <p className="text-text-muted/70 text-xs mt-2.5">
            Starts with:{' '}
            {race.startingEquipment
              .map((i) => (i.qty > 1 ? `${i.name} ×${i.qty}` : i.name))
              .join(', ')}
          </p>
        )}
      </div>
    </button>
  )
}

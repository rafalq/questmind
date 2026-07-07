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
      </div>
    </button>
  )
}

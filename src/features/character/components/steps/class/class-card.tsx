// steps/class/class-card.tsx
import ModifierBadge from '@/features/character/components/steps/modifier-badge'
import type { ClassDefinition } from '@/features/character/constants'

export default function ClassCard({
  cls,
  selected,
  onSelect,
}: {
  cls: ClassDefinition
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
            {cls.label}
          </p>
          <p className="text-text-muted text-sm mt-1">{cls.description}</p>
        </div>
        <div className="flex flex-col gap-1 shrink-0">
          {Object.entries(cls.modifiers).map(([attr, val]) => (
            <ModifierBadge key={attr} attr={attr} val={val ?? 0} />
          ))}
        </div>
      </div>
    </button>
  )
}

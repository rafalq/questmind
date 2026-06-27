import { type GameSnapshot } from '@/db/schema/session'
import { type charactersTable } from '@/db/schema'

type Character = typeof charactersTable.$inferSelect

type Props = {
  snapshot: GameSnapshot | null
  character: Character
}

export default function StatsPanel({ snapshot, character }: Props) {
  const hp = snapshot?.hp ?? 100
  const maxHp = snapshot?.maxHp ?? 100
  const inventory = snapshot?.inventory ?? []
  const quests = snapshot?.quests ?? []
  const hpPercent = Math.max(0, Math.min(100, (hp / maxHp) * 100))

  const hpColor =
    hpPercent > 60
      ? 'bg-accent'
      : hpPercent > 30
        ? 'bg-yellow-500'
        : 'bg-red-600'

  return (
    <div className="p-5 space-y-6">
      {/* Character info */}
      <div>
        <h3 className="text-xs text-text-muted uppercase tracking-widest mb-1">
          Character
        </h3>
        <p className="text-text-primary font-bold">{character.name}</p>
        <p className="text-text-muted text-xs">
          {character.race} · {character.characterClass.replace('_', ' ')}
        </p>
      </div>

      {/* HP bar */}
      <div>
        <div className="flex justify-between mb-1">
          <h3 className="text-xs text-text-muted uppercase tracking-widest">
            HP
          </h3>
          <span className="text-xs text-text-secondary">
            {hp} / {maxHp}
          </span>
        </div>
        <div className="w-full h-2 bg-surface border border-border">
          <div
            className={`h-full transition-all duration-500 ${hpColor}`}
            style={{ width: `${hpPercent}%` }}
          />
        </div>
      </div>

      {/* Inventory */}
      <div>
        <h3 className="text-xs text-text-muted uppercase tracking-widest mb-2">
          Inventory
        </h3>
        {inventory.length === 0 ? (
          <p className="text-text-muted text-xs">Nothing yet.</p>
        ) : (
          <ul className="space-y-1">
            {inventory.map((item, i) => (
              <li
                key={i}
                className="text-sm text-text-secondary flex items-center gap-2"
              >
                <span className="w-1 h-1 bg-accent rounded-full shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Quests */}
      <div>
        <h3 className="text-xs text-text-muted uppercase tracking-widest mb-2">
          Quests
        </h3>
        {quests.length === 0 ? (
          <p className="text-text-muted text-xs">No active quests.</p>
        ) : (
          <ul className="space-y-2">
            {quests.map((quest) => (
              <li key={quest.id} className="text-sm">
                <span
                  className={
                    quest.status === 'completed'
                      ? 'text-text-muted line-through'
                      : 'text-text-secondary'
                  }
                >
                  {quest.title}
                </span>
                {quest.status === 'completed' && (
                  <span className="ml-2 text-xs text-accent">✓</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

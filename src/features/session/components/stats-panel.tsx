import { type GameSnapshot } from '@/db/schema/session'
import { type charactersTable } from '@/db/schema'
import {
  IconBackpack,
  IconHeart,
  IconMapSearch,
  IconShield,
  IconUserShield,
} from '@tabler/icons-react'

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
        <div className="text-text-muted text-xs inline-flex items-center gap-1">
          <div className="flex items-center gap-1 justify-center">
            <IconUserShield size={10} />
            <span className="capitalize">{character.race}</span>
          </div>{' '}
          ·{' '}
          <div className="flex items-center gap-1 justify-center">
            <IconShield size={10} />
            <span className="capitalize">
              {character.characterClass.replaceAll('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* HP bar */}
      <div>
        <div className="flex justify-between mb-1">
          <h3 className="text-xs text-text-muted uppercase tracking-widest flex items-center gap-1 justify-center">
            <IconHeart stroke={2} size={12} /> HP
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
        <h3 className="text-xs text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
          <IconBackpack size={12} /> Inventory
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
        <h3 className="text-xs text-text-muted uppercase tracking-widest mb-2 flex items-center gap-1">
          <IconMapSearch size={12} /> Quests
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

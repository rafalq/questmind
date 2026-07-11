'use client'

import { type charactersTable } from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'
import {
  buildInventoryDisplay,
  type InventoryEntry,
} from '@/features/session/lib/inventory-display'
import type { ItemCategory } from '@/worlds/schema'
import {
  IconFlask,
  IconHeart,
  IconMapSearch,
  IconPackage,
  IconShield,
  IconShirt,
  IconSparkles,
  IconSword,
  IconTool,
  IconUserShield,
} from '@tabler/icons-react'
import { useState } from 'react'

type Character = typeof charactersTable.$inferSelect

type Props = {
  snapshot: GameSnapshot | null
  character: Character
}

const CATEGORY_ICONS: Record<ItemCategory, typeof IconSword> = {
  weapon: IconSword,
  armor: IconShirt,
  consumable: IconFlask,
  tool: IconTool,
  relic: IconSparkles,
  misc: IconPackage,
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
      <InventorySection
        entries={buildInventoryDisplay(inventory, character.world)}
      />

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

function InventorySection({ entries }: { entries: InventoryEntry[] }) {
  // Which item rows are expanded. Click, not hover — the panel must work on
  // touch at 360px (NFR-004), where hover doesn't exist.
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  return (
    <div className="flex flex-col min-h-0">
      <h3 className="text-sm text-text-muted font-bold uppercase tracking-widest mb-3 flex items-center gap-1 shrink-0">
        Inventory
      </h3>

      {entries.length === 0 ? (
        <p className="text-text-muted text-xs">Nothing yet.</p>
      ) : (
        <ul className="space-y-1 overflow-y-auto min-h-0 max-h-64 pr-1">
          {entries.map((entry) => {
            const Icon = CATEGORY_ICONS[entry.category]
            const isOpen = expanded.has(entry.name)

            return (
              <li key={entry.name}>
                <button
                  type="button"
                  onClick={() => toggle(entry.name)}
                  disabled={!entry.description}
                  className="w-full flex items-center gap-2 text-left text-sm text-text-secondary hover:text-text-primary disabled:hover:text-text-secondary transition-colors py-0.5"
                >
                  <Icon size={13} className="shrink-0 text-text-muted" />
                  <span className="flex-1">{entry.name}</span>
                  {entry.qty > 1 && (
                    <span className="text-xs text-text-muted shrink-0">
                      ×{entry.qty}
                    </span>
                  )}
                </button>

                {isOpen && entry.description && (
                  <p className="text-xs text-text-muted pl-[21px] pr-1 pb-1.5 leading-snug">
                    {entry.description}
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

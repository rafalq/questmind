'use client'

import type { AbilityDefinition } from '@/worlds/schema'
import { type charactersTable } from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'
import {
  buildInventoryDisplay,
  type InventoryEntry,
} from '@/features/session/lib/inventory-display'
import type { ItemCategory } from '@/worlds/schema'
import { getWorld } from '@/worlds'
import { resolveAbilities } from '@/features/character/lib/progression'
import {
  IconFlask,
  IconPackage,
  IconShirt,
  IconSparkles,
  IconSword,
  IconTool,
  IconBolt,
} from '@tabler/icons-react'
import { useState } from 'react'

type Character = typeof charactersTable.$inferSelect

type Props = {
  snapshot: GameSnapshot | null
  character: Character
  onUseAbility: (name: string) => void
}

const CATEGORY_ICONS: Record<ItemCategory, typeof IconSword> = {
  weapon: IconSword,
  armor: IconShirt,
  consumable: IconFlask,
  tool: IconTool,
  relic: IconSparkles,
  misc: IconPackage,
}

// Colour carries the category faster than icon shape does at 13px.
const CATEGORY_COLORS: Record<ItemCategory, string> = {
  weapon: 'text-red-400/70',
  armor: 'text-slate-400/70',
  consumable: 'text-emerald-400/70',
  tool: 'text-amber-500/60',
  relic: 'text-accent',
  misc: 'text-text-muted',
}

export default function StatsPanel({
  snapshot,
  character,
  onUseAbility,
}: Props) {
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

  const tier = snapshot?.tier ?? 1
  const level = snapshot?.level ?? 1

  const classDef = getWorld(character.world).classes.find(
    (c) => c.value === character.characterClass
  )
  const abilities = classDef ? resolveAbilities(classDef.abilities, tier) : []

  return (
    <div className="p-6 divide-y divide-border/40 [&>*]:py-5 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
      {/* Character info */}
      <div>
        <h3 className="text-[10px] text-text-muted/60 uppercase tracking-widest mb-2">
          Character
        </h3>
        <p className="text-text-primary font-bold">{character.name}</p>
        <div className="text-text-muted text-xs inline-flex items-center gap-1">
          <span className="capitalize">{character.race}</span> ·{' '}
          <span>{classDef?.label ?? character.characterClass}</span>
        </div>
        <p className="text-text-muted/70 text-xs mt-1">
          Level {level} · Tier {tier}
        </p>
      </div>

      {/* HP bar */}
      <div>
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-[10px] text-text-muted/60 uppercase tracking-widest flex items-center gap-1">
            HP
          </h3>
          <span className="text-xl font-bold text-text-primary tabular-nums">
            {hp}
            <span className="text-sm text-text-muted font-normal">
              {' '}
              / {maxHp}
            </span>
          </span>
        </div>
        <div className="w-full h-2 bg-bg-base border border-border">
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

      {/* Abilities */}
      <AbilitiesSection abilities={abilities} onUseAbility={onUseAbility} />

      {/* Quests */}
      <div>
        <h3 className="text-[10px] text-text-muted/60 uppercase tracking-widest flex items-center gap-1 mb-2">
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
      <h3 className="text-[10px] text-text-muted/60 uppercase tracking-widest mb-3 flex items-center gap-1 shrink-0 mb-2">
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
                  <Icon
                    size={14}
                    className={`shrink-0 ${CATEGORY_COLORS[entry.category]}`}
                  />
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

function AbilitiesSection({
  abilities,
  onUseAbility,
}: {
  abilities: AbilityDefinition[]
  onUseAbility: (name: string) => void
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const toggle = (value: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(value) ? next.delete(value) : next.add(value)
      return next
    })
  }

  return (
    <div>
      <h3 className="text-[10px] text-text-muted/60 uppercase tracking-widest mb-2">
        Abilities
      </h3>

      {abilities.length === 0 ? (
        <p className="text-text-muted text-xs">None yet.</p>
      ) : (
        <ul className="space-y-1">
          {abilities.map((ability) => {
            const isOpen = expanded.has(ability.value)
            const cost =
              ability.cost?.kind === 'hp' ? `${ability.cost.amount} HP` : null

            return (
              <li key={ability.value}>
                {/* Two targets, one row: the bolt seeds the composer, the name
                    reveals the description. Separate buttons, because a single
                    click cannot mean both. */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onUseAbility(ability.name)}
                    title={`Use ${ability.name}`}
                    aria-label={`Use ${ability.name}`}
                    className="shrink-0 text-accent/60 hover:bg-accent/20 hover:text-accent p-1 border border-border"
                  >
                    <IconBolt size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggle(ability.value)}
                    aria-expanded={isOpen}
                    className="flex-1 flex items-center gap-2 text-left text-sm text-text-secondary hover:text-text-primary transition-colors py-0.5"
                  >
                    <span className="flex-1">{ability.name}</span>
                    {cost && (
                      <span className="text-xs text-red-400/70 shrink-0">
                        {cost}
                      </span>
                    )}
                  </button>
                </div>

                {isOpen && (
                  <p className="text-xs text-text-muted pl-[21px] pr-1 pb-1.5 leading-snug">
                    {ability.description}
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

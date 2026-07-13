'use client'

import { genreBg, genreFont, GenreIcon } from '@/lib/genre-theme'
import { useEffect, useState } from 'react'
import {
  computeTier,
  effectiveAttributes,
  resolveAbilities,
} from '@/features/character/lib/progression'
import { levelFromXp } from '@/features/character/constants/progression'
import { calculateMaxHp } from '@/features/character/lib/hp'
import { getWorld, getClassLabel, getRaceLabel } from '@/worlds'
import type {
  AbilityDefinition,
  Attribute,
  AttributeLabels,
} from '@/worlds/schema'
import type { Genre } from '@/features/character/constants/'
import { IconBolt, IconHeart, IconStar, IconX } from '@tabler/icons-react'

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * A row as it comes out of characterAttributesTable. Not to be confused with
 * Attribute (the key: 'mind', 'strength', ...) imported from the registry.
 * `value` is baseValue: point-buy plus race, class and gender modifiers,
 * WITHOUT per-level growth, which is derived on read.
 */
type AttributeRow = {
  attributeName: string
  value: number
}

type ActiveCampaign = {
  campaignId: string | null
  campaignName: string
  currentHp: number
  maxHp: number
  sessionId: string
}

/**
 * This modal is a character sheet, not a game-state view: who the character is,
 * not what is happening to them right now. Live HP and current inventory belong
 * to the session and are shown in the stats panel, where they are actually up to
 * date. Duplicating them here meant reading charactersTable.inventory (the
 * starting kit, frozen at creation) and campaignCharacters.currentHp — both
 * stale, and both silently wrong.
 *
 * activeCampaign stays on the type because CharacterCard uses it for the resume
 * button; the modal itself no longer touches it.
 */
export type CharacterDetail = {
  id: string
  name: string
  genre: Genre
  world: string
  race: string
  characterClass: string
  characterXp: number
  isAlive: boolean
  inventory: string[]
  attributes: AttributeRow[]
  activeCampaign: ActiveCampaign | null
}

type Props = {
  character: CharacterDetail
  onClose: () => void
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({
  icon,
  label,
}: {
  icon: React.ReactNode
  label: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-text-muted uppercase tracking-widest mb-3">
      {icon}
      {label}
    </div>
  )
}

function ModalHeader({
  genre,
  onClose,
}: {
  genre: Genre
  onClose: () => void
}) {
  return (
    <div className="flex items-center justify-between p-6 border-b border-border/50">
      <div className="flex items-center gap-2 text-xs text-text-muted uppercase tracking-widest">
        <GenreIcon genre={genre} />
        {genre}
      </div>
      <button
        onClick={onClose}
        className="text-text-muted hover:text-text-primary transition-colors"
        aria-label="Close"
      >
        <IconX size={18} />
      </button>
    </div>
  )
}

function CharacterSummary({
  character,
  level,
  tier,
}: {
  character: CharacterDetail
  level: number
  tier: number
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary">{character.name}</h2>
      <p className="text-sm text-text-secondary mt-1">
        {getRaceLabel(character.world, character.race)} ·{' '}
        {getClassLabel(character.world, character.characterClass)}
      </p>
      <p className="text-xs text-text-muted mt-1">
        Level {level} · Tier {tier} · {character.characterXp} XP ·{' '}
        <span className={character.isAlive ? 'text-accent' : 'text-red-500'}>
          {character.isAlive ? 'Alive' : 'Dead'}
        </span>
      </p>
    </div>
  )
}

function AttributeGrid({
  attributes,
  labels,
  keyAttribute,
  maxHp,
}: {
  attributes: Record<Attribute, number>
  labels: AttributeLabels
  keyAttribute?: Attribute
  maxHp: number
}) {
  return (
    <div>
      <SectionLabel icon={<IconStar size={13} />} label="Attributes" />
      <div className="grid grid-cols-2 gap-2">
        {/* Iterate the registry's labels, not the object built from DB rows:
            that gives the world's intended order rather than Postgres's. */}
        {(Object.keys(labels) as Attribute[]).map((key) => {
          // The key attribute gates tier progression — the one number worth
          // watching, so it gets the accent.
          const isKey = key === keyAttribute

          return (
            <div
              key={key}
              className={`flex items-center justify-between px-3 py-2 border ${
                isKey ? 'border-accent/40' : 'border-border/50'
              }`}
            >
              <span
                className={`text-xs ${
                  isKey ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                {labels[key]}
              </span>
              <span
                className={`text-sm font-bold ${
                  isKey ? 'text-accent' : 'text-text-primary'
                }`}
              >
                {attributes[key]}
              </span>
            </div>
          )
        })}
      </div>

      {/* Derived, not stored: maxHp follows endurance, which grows per level. */}
      <div className="flex items-center justify-between px-3 py-2 mt-2 border border-border/50">
        <span className="flex items-center gap-1.5 text-xs text-text-secondary">
          <IconHeart size={12} />
          Max HP
        </span>
        <span className="text-sm font-bold text-text-primary tabular-nums">
          {maxHp}
        </span>
      </div>
    </div>
  )
}

function AbilityList({ abilities }: { abilities: AbilityDefinition[] }) {
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
      <SectionLabel icon={<IconBolt size={13} />} label="Abilities" />

      {abilities.length === 0 ? (
        <p className="text-sm text-text-muted">None yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {abilities.map((ability) => {
            const isOpen = expanded.has(ability.value)
            const cost =
              ability.cost?.kind === 'hp' ? `${ability.cost.amount} HP` : null

            return (
              <li key={ability.value} className="border border-border/30">
                <button
                  type="button"
                  onClick={() => toggle(ability.value)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-sm text-text-secondary hover:text-text-primary transition-colors"
                >
                  <IconBolt size={13} className="shrink-0 text-accent/60" />
                  <span className="flex-1">{ability.name}</span>
                  {cost && (
                    <span className="text-xs text-red-400/70 shrink-0">
                      {cost}
                    </span>
                  )}
                </button>

                {isOpen && (
                  <p className="text-xs text-text-muted px-3 pb-2 pl-8 leading-snug">
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

// ─── Main export ──────────────────────────────────────────────────────────────

export default function CharacterDetailModal({ character, onClose }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Everything below derives from characterXp. Nothing about progression is
  // stored, so a levelled character shows its current numbers rather than its
  // creation-day ones — and the sheet is correct with no session in progress.
  const level = levelFromXp(character.characterXp)

  const world = getWorld(character.world)
  const classDef = world.classes.find(
    (c) => c.value === character.characterClass
  )

  const baseAttributes = Object.fromEntries(
    character.attributes.map((a) => [a.attributeName, a.value])
  ) as Record<Attribute, number>

  const attributes = classDef
    ? effectiveAttributes(baseAttributes, classDef, level)
    : baseAttributes

  const tier = classDef
    ? computeTier(level, attributes[classDef.keyAttribute])
    : 1

  const abilities = classDef ? resolveAbilities(classDef.abilities, tier) : []

  const maxHp = calculateMaxHp(attributes.endurance)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border flex flex-col"
        style={{
          fontFamily: genreFont[character.genre],
          backgroundColor: genreBg[character.genre],
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader genre={character.genre} onClose={onClose} />

        <div className="p-6 flex flex-col gap-6">
          <CharacterSummary character={character} level={level} tier={tier} />

          <AttributeGrid
            attributes={attributes}
            labels={world.attributeLabels}
            keyAttribute={classDef?.keyAttribute}
            maxHp={maxHp}
          />

          <AbilityList abilities={abilities} />
        </div>
      </div>
    </div>
  )
}

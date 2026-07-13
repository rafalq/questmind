'use client'

import { genreBg, genreFont, GenreIcon } from '@/lib/genre-theme'
import { useEffect } from 'react'
import { effectiveAttributes } from '@/features/character/lib/progression'
import { levelFromXp } from '@/features/character/constants/progression'
import { getWorld, getClassLabel, getRaceLabel } from '@/worlds'
import type { Attribute, AttributeLabels } from '@/worlds/schema'
import type { Genre } from '@/features/character/constants/'
import { IconHeart, IconPackage, IconStar, IconX } from '@tabler/icons-react'

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

function HpBar({ current, max }: { current: number; max: number }) {
  const percent = Math.round((current / max) * 100)

  return (
    <div>
      <SectionLabel icon={<IconHeart size={13} />} label="Hit Points" />
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-border">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-xs text-text-secondary tabular-nums">
          {current} / {max}
        </span>
      </div>
    </div>
  )
}

function AttributeGrid({
  attributes,
  labels,
  keyAttribute,
}: {
  attributes: Record<Attribute, number>
  labels: AttributeLabels
  keyAttribute?: Attribute
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
    </div>
  )
}

function InventoryList({ items }: { items: string[] }) {
  if (items.length === 0) return null

  return (
    <div>
      <SectionLabel icon={<IconPackage size={13} />} label="Inventory" />
      <ul className="flex flex-col gap-1">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm text-text-secondary px-3 py-1.5 border border-border/30"
          >
            {item}
          </li>
        ))}
      </ul>
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
      >
        <IconX size={18} />
      </button>
    </div>
  )
}

function CharacterSummary({
  character,
  level,
}: {
  character: CharacterDetail
  level: number
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary">{character.name}</h2>
      <p className="text-sm text-text-secondary mt-1">
        {getRaceLabel(character.world, character.race)} ·{' '}
        {getClassLabel(character.world, character.characterClass)} · Level{' '}
        {level}
      </p>
      <p className="text-xs text-text-muted mt-0.5">
        {character.characterXp} XP ·{' '}
        <span className={character.isAlive ? 'text-accent' : 'text-red-500'}>
          {character.isAlive ? 'Alive' : 'Dead'}
        </span>
      </p>
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

  // Level and attributes are both derived from characterXp: nothing about
  // progression is stored, so a levelled character shows current numbers rather
  // than its creation-day ones.
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
          <CharacterSummary character={character} level={level} />

          {character.activeCampaign && (
            <HpBar
              current={character.activeCampaign.currentHp}
              max={character.activeCampaign.maxHp}
            />
          )}

          <AttributeGrid
            attributes={attributes}
            labels={world.attributeLabels}
            keyAttribute={classDef?.keyAttribute}
          />
          <InventoryList items={character.inventory} />
        </div>
      </div>
    </div>
  )
}

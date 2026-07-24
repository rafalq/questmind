'use client'

import Modal from '@/components/ui/modal'
import { formatAbilityCost } from '@/features/character/lib/ability-cost'
import { useExpandableSet } from '@/hooks/use-expandable-set'
import { GenreIcon } from '@/lib/genre-theme'
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
import { CharacterDetail } from '@/features/character/types/character-detail'

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
    <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-widest text-text-secondary">
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
    <div className="flex items-center justify-between border-b border-border/50 p-4 sm:p-6">
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-text-secondary">
        <GenreIcon genre={genre} />
        {genre}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="-m-2 p-2 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
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
  titleId,
}: {
  character: CharacterDetail
  level: number
  tier: number
  titleId: string
}) {
  return (
    <div>
      <h2
        id={titleId}
        className="wrap-break-word text-xl font-bold text-text-primary sm:text-2xl"
      >
        {character.name}
      </h2>
      <p className="mt-1 text-sm text-text-secondary">
        {getRaceLabel(character.world, character.race)} ·{' '}
        {getClassLabel(character.world, character.characterClass)}
      </p>
      <p className="mt-1 text-xs text-text-muted">
        Level {level} · Tier {tier} · {character.characterXp} XP ·{' '}
        <span
          className={
            character.isAlive
              ? 'text-accent'
              : 'font-semibold text-red-600 dark:text-red-400'
          }
        >
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
      {/* One column on the narrowest phones: two 3-character labels plus a
          number do not fit side by side at 360px without truncating. */}
      <div className="grid grid-cols-1 gap-2 xs:grid-cols-2 sm:grid-cols-2">
        {/* Iterate the registry's labels, not the object built from DB rows:
            that gives the world's intended order rather than Postgres's. */}
        {(Object.keys(labels) as Attribute[]).map((key) => {
          // The key attribute gates tier progression — the one number worth
          // watching, so it gets the accent.
          const isKey = key === keyAttribute

          return (
            <div
              key={key}
              className={`flex items-center justify-between gap-2 border px-3 py-2 ${
                isKey ? 'border-accent/40 bg-accent/5' : 'border-border/50'
              }`}
            >
              <span
                className={`truncate text-xs ${
                  isKey ? 'text-accent' : 'text-text-secondary'
                }`}
              >
                {labels[key]}
              </span>
              {/* tabular-nums so the column of values does not jitter between
                  one- and two-digit scores. */}
              <span
                className={`shrink-0 text-sm font-bold tabular-nums ${
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
      <div className="mt-2 flex items-center justify-between gap-2 border border-border/50 px-3 py-2">
        <span className="flex items-center gap-1.5 text-xs text-text-secondary">
          <IconHeart size={12} />
          Max HP
        </span>
        <span className="shrink-0 text-sm font-bold tabular-nums text-text-primary">
          {maxHp}
        </span>
      </div>
    </div>
  )
}

function AbilityList({ abilities }: { abilities: AbilityDefinition[] }) {
  const { isExpanded, toggle } = useExpandableSet()

  return (
    <div>
      <SectionLabel icon={<IconBolt size={13} />} label="Abilities" />

      {abilities.length === 0 ? (
        <p className="text-sm text-text-muted">None yet.</p>
      ) : (
        <ul className="flex flex-col gap-1">
          {abilities.map((ability) => {
            const isOpen = isExpanded(ability.value)
            const cost =
              formatAbilityCost(ability.cost)

            return (
              <li key={ability.value} className="border border-border/30">
                <button
                  type="button"
                  onClick={() => toggle(ability.value)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
                >
                  <IconBolt size={13} className="shrink-0 text-accent" />
                  <span className="flex-1">{ability.name}</span>
                  {cost && (
                    <span className="shrink-0 text-xs text-red-600 dark:text-red-400">
                      {cost}
                    </span>
                  )}
                </button>

                {isOpen && (
                  <p className="px-3 pb-2 pl-8 text-xs leading-snug text-text-muted">
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
    <Modal open onClose={onClose} genre={character.genre} size="md">
      {(titleId) => (
        <>
          <ModalHeader genre={character.genre} onClose={onClose} />

          <div className="flex flex-col gap-6 p-4 sm:p-6">
            <CharacterSummary
              character={character}
              level={level}
              tier={tier}
              titleId={titleId}
            />

            <AttributeGrid
              attributes={attributes}
              labels={world.attributeLabels}
              keyAttribute={classDef?.keyAttribute}
              maxHp={maxHp}
            />

            <AbilityList abilities={abilities} />
          </div>
        </>
      )}
    </Modal>
  )
}

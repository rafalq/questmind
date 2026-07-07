'use client'

import { useEffect } from 'react'
import { genreFont, genreBg, genreIcon } from '@/lib/genre-config'
import type { Genre } from '@/features/character/constants/'
import {
  IconX,
  IconHeart,
  IconStar,
  IconPackage,
  IconBook,
} from '@tabler/icons-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type Attribute = {
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
  race: string
  characterClass: string
  level: number
  characterXp: number
  isAlive: boolean
  backstory: string | null
  inventory: string[]
  attributes: Attribute[]
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

function AttributeGrid({ attributes }: { attributes: Attribute[] }) {
  if (!attributes || attributes.length === 0) return null

  return (
    <div>
      <SectionLabel icon={<IconStar size={13} />} label="Attributes" />
      <div className="grid grid-cols-2 gap-2">
        {attributes.map((attr, i) => (
          <div
            key={`${attr.attributeName}-${i}`}
            className="flex items-center justify-between px-3 py-2 border border-border/50"
          >
            <span className="text-xs text-text-secondary capitalize">
              {attr.attributeName?.replace(/_/g, ' ') ?? '—'}
            </span>
            <span className="text-sm font-bold text-text-primary">
              {attr.value}
            </span>
          </div>
        ))}
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

function Backstory({ text }: { text: string }) {
  return (
    <div>
      <SectionLabel icon={<IconBook size={13} />} label="Backstory" />
      <p className="text-sm text-text-secondary leading-relaxed">{text}</p>
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
        {genreIcon[genre]}
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

function CharacterSummary({ character }: { character: CharacterDetail }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary">{character.name}</h2>
      <p className="text-sm text-text-secondary capitalize mt-1">
        {character.race} · {character.characterClass.replace(/_/g, ' ')} · Level{' '}
        {character.level}
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

  console.log('CharacterDetailModal rendered with character:', character)

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
          <CharacterSummary character={character} />

          {character.activeCampaign && (
            <HpBar
              current={character.activeCampaign.currentHp}
              max={character.activeCampaign.maxHp}
            />
          )}

          <AttributeGrid attributes={character.attributes} />
          <InventoryList items={character.inventory} />
          {character.backstory && <Backstory text={character.backstory} />}
        </div>
      </div>
    </div>
  )
}

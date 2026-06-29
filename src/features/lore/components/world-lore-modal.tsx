'use client'

import { useState } from 'react'
import { IconMap, IconX, IconBook } from '@tabler/icons-react'
import type { WorldLore } from '@/features/lore/queries/get-world-lore'
import type { Genre } from '@/features/character/constants'
import { genreFont, genreBg } from '@/lib/genre-config'

type Props = {
  genre: Genre
  lore: WorldLore
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ModalTrigger({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex items-center gap-1.5 text-[11px] text-text-muted hover:text-text-primary transition-colors cursor-pointer"
      style={{ fontFamily: 'var(--font-rajdhani)' }}
    >
      <IconMap size={13} />
      <span className="uppercase tracking-widest">{name}</span>
    </button>
  )
}

function ModalBackdrop({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    />
  )
}

function ModalHeader({
  name,
  subtitle,
  onClose,
}: {
  name: string
  subtitle: string
  onClose: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 p-6 border-b border-border/50">
      <div>
        <p
          className="text-xs uppercase tracking-widest text-text-muted mb-1"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          <IconBook size={12} className="inline mr-1" />
          World Lore
        </p>
        <h2 className="text-2xl font-bold text-text-primary">{name}</h2>
        {subtitle && (
          <p className="text-sm text-text-muted italic mt-0.5">{subtitle}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-text-muted hover:text-text-primary transition-colors mt-1 cursor-pointer"
      >
        <IconX size={20} />
      </button>
    </div>
  )
}

function MapPlaceholder({ regionName }: { regionName: string }) {
  return (
    <div className="mx-6 mt-6 h-48 border border-border/40 flex items-center justify-center bg-black/20">
      <div
        className="text-center text-text-muted text-xs uppercase tracking-widest"
        style={{ fontFamily: 'var(--font-rajdhani)' }}
      >
        <IconMap size={32} className="mx-auto mb-2 opacity-30" />
        <p>{regionName}</p>
        <p className="text-[10px] mt-1 opacity-50">Coming soon</p>
      </div>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-xs uppercase tracking-widest text-text-muted mb-3"
      style={{ fontFamily: 'var(--font-rajdhani)' }}
    >
      {children}
    </h3>
  )
}

function WorldSection({ publicLore }: { publicLore: string }) {
  return (
    <section>
      <SectionHeading>The World</SectionHeading>
      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
        {publicLore}
      </p>
    </section>
  )
}

function RegionSection({
  region,
}: {
  region: NonNullable<WorldLore['region']>
}) {
  return (
    <section>
      <SectionHeading>
        {region.name}
        {region.nameTranslation && (
          <span className="normal-case ml-2 opacity-60">
            — {region.nameTranslation}
          </span>
        )}
      </SectionHeading>
      <p className="text-sm text-text-secondary leading-relaxed">
        {region.description}
      </p>
    </section>
  )
}

function TimelineSection({ events }: { events: WorldLore['events'] }) {
  if (events.length === 0) return null

  return (
    <section>
      <SectionHeading>Known History</SectionHeading>
      <div className="flex flex-col gap-4">
        {events.map((event) => (
          <div key={event.yearLabel} className="flex gap-4">
            <div
              className="text-[11px] text-text-muted shrink-0 w-20 pt-0.5 uppercase tracking-wide"
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              {event.yearLabel}
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-text-primary">
                {event.title}
              </p>
              <p className="text-sm text-text-secondary leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function WorldLoreModal({ genre, lore }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <ModalTrigger name={lore.world.name} onOpen={() => setIsOpen(true)} />

      {isOpen && (
        <>
          <ModalBackdrop onClose={() => setIsOpen(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div
              className="pointer-events-auto w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-border flex flex-col"
              style={{
                fontFamily: genreFont[genre],
                backgroundColor: genreBg[genre],
                scrollbarWidth: 'thin',
                scrollbarColor: `var(--color-border) transparent`,
              }}
            >
              <ModalHeader
                name={lore.world.name}
                subtitle={lore.world.subtitle}
                onClose={() => setIsOpen(false)}
              />
              <MapPlaceholder
                regionName={lore.region?.name ?? lore.world.name}
              />
              <div className="p-6 flex flex-col gap-8">
                <WorldSection publicLore={lore.world.publicLore} />
                {lore.region && <RegionSection region={lore.region} />}
                <TimelineSection events={lore.events} />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

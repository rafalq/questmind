'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { IconMap, IconX, IconBook } from '@tabler/icons-react'
import type { WorldLore } from '@/features/lore/queries/get-world-lore'
import type { Genre } from '@/features/character/constants/'
import { genreFont } from '@/lib/genre-theme'

type Props = {
  genre: Genre
  lore: WorldLore
}

// ── Sub-components ─────────────────────────────────────────────────────────

function ModalTrigger({ name, onOpen }: { name: string; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex cursor-pointer items-center gap-1.5 text-[11px] text-text-muted transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{ fontFamily: 'var(--font-rajdhani)' }}
    >
      <IconMap size={13} />
      <span className="uppercase tracking-widest">{name}</span>
    </button>
  )
}

function ModalBackdrop({ onClose }: { onClose: () => void }) {
  // Black in both themes on purpose: this is a dimmer, not a surface, so it
  // does not follow the palette.
  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      aria-hidden
    />
  )
}

function ModalHeader({
  name,
  subtitle,
  onClose,
  titleId,
}: {
  name: string
  subtitle: string
  onClose: () => void
  titleId: string
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/50 p-4 sm:p-6">
      <div className="min-w-0">
        <p
          className="mb-1 text-xs uppercase tracking-widest text-text-secondary"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          <IconBook size={12} className="mr-1 inline" />
          World Lore
        </p>
        <h2
          id={titleId}
          className="wrap-break-word text-xl font-bold text-text-primary sm:text-2xl"
        >
          {name}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-sm italic text-text-secondary">
            {subtitle}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="-m-2 shrink-0 cursor-pointer p-2 text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <IconX size={20} />
      </button>
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="mb-3 text-xs uppercase tracking-widest text-text-secondary"
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
      <p className="whitespace-pre-line text-sm leading-relaxed text-text-secondary">
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
          // text-text-muted rather than opacity: an alpha on top of an already
          // low-contrast colour is what made these secondary labels vanish in
          // the light theme.
          <span className="ml-2 normal-case text-text-muted">
            — {region.nameTranslation}
          </span>
        )}
      </SectionHeading>
      <p className="text-sm leading-relaxed text-text-secondary">
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
          // Year above the entry on a phone, beside it from sm up: a fixed
          // 5rem gutter plus body text does not work at 360px.
          <div
            key={event.yearLabel}
            className="flex flex-col gap-1 sm:flex-row sm:gap-4"
          >
            <div
              className="w-20 shrink-0 pt-0.5 text-[11px] uppercase tracking-wide text-text-muted"
              style={{ fontFamily: 'var(--font-rajdhani)' }}
            >
              {event.yearLabel}
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="text-sm font-semibold text-text-primary">
                {event.title}
              </p>
              <p className="text-sm leading-relaxed text-text-secondary">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function MapImage({ genre, regionName }: { genre: Genre; regionName: string }) {
  const mapSrc: Partial<Record<Genre, string>> = {
    fantasy: '/images/fantasy/treigthe/maps/treigthe.jpg',
  }

  const src = mapSrc[genre]

  if (!src) {
    return (
      <div className="mx-4 mt-4 flex h-48 items-center justify-center border border-border/40 bg-bg-base/50 sm:mx-6 sm:mt-6">
        <div
          className="text-center text-xs uppercase tracking-widest text-text-muted"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          <IconMap size={32} className="mx-auto mb-2" />
          <p>{regionName}</p>
          <p className="mt-1 text-[10px]">Coming soon</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-4 mt-4 border border-border/40 sm:mx-6 sm:mt-6">
      <Image
        src={src}
        alt={`Map of ${regionName}`}
        width={1472}
        height={832}
        loading="eager"
        // The dialog caps at max-w-2xl (42rem) minus padding, so 100vw only
        // holds on phones.
        sizes="(max-width: 42rem) 100vw, 40rem"
        style={{ width: '100%', height: 'auto' }}
      />
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────

export default function WorldLoreModal({ genre, lore }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)

  // Escape closes. Bound only while open, so there is no listener sitting on
  // every campaign card on the dashboard.
  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen])

  // Move focus into the dialog on open so keyboard users land inside it
  // rather than continuing from the card behind.
  useEffect(() => {
    if (isOpen) dialogRef.current?.focus()
  }, [isOpen])

  return (
    <>
      <ModalTrigger name={lore.world.name} onOpen={() => setIsOpen(true)} />

      {isOpen && (
        <>
          <ModalBackdrop onClose={() => setIsOpen(false)} />
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              tabIndex={-1}
              // data-genre scopes --qm-bg-genre, which has a value per theme.
              // The old inline backgroundColor from genreBg pinned this panel
              // dark in both themes while the text tokens followed the theme —
              // so in the light theme it was dark text on a dark surface. Not
              // .on-media: there is no artwork behind the panel, so it should
              // be a light surface in the light theme and use ordinary tokens.
              data-genre={genre}
              className="pointer-events-auto flex max-h-[85dvh] w-full max-w-2xl flex-col overflow-y-auto border border-border bg-bg-genre shadow-xl scrollbar-subtle focus:outline-none"
              style={{ fontFamily: genreFont[genre] }}
            >
              <ModalHeader
                name={lore.world.name}
                subtitle={lore.world.subtitle}
                onClose={() => setIsOpen(false)}
                titleId={titleId}
              />
              <MapImage
                genre={genre}
                regionName={lore.region?.name ?? lore.world.name}
              />
              <div className="flex flex-col gap-8 p-4 sm:p-6">
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

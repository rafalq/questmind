'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Image from 'next/image'
import { IconMap, IconX, IconBook } from '@tabler/icons-react'
import type { WorldLore } from '@/features/lore/queries/get-world-lore'
import type { Genre } from '@/features/character/constants/'
import { genreFont } from '@/lib/genre-theme'
import { getWorld } from '@/worlds'
import { WORLD_GLOSSARIES } from '@/worlds/schema/glossary'
import type { GlossaryEntry } from '@/worlds/schema/glossary'

type Props = {
  genre: Genre
  lore: WorldLore
  /** Rendered instead of the default text trigger — lets the session screen
   *  open the same modal from an icon button without a second component. */
  trigger?: (open: () => void) => React.ReactNode
}

// Section order is also reading order: what the world is, what happened,
// who lives there, what you can be, where you can go, what the words mean.
const SECTIONS = [
  { id: 'world', label: 'The World' },
  { id: 'history', label: 'History' },
  { id: 'peoples', label: 'Peoples' },
  { id: 'trades', label: 'Trades' },
  { id: 'places', label: 'Places' },
  { id: 'glossary', label: 'Glossary' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

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

/** Jump list under the map. Scrolls the dialog body rather than following an
 *  anchor: the panel is the scroll container, and a native #hash would move
 *  the page behind it instead. */
function TableOfContents({ onJump }: { onJump: (id: SectionId) => void }) {
  return (
    <nav
      aria-label="Sections"
      className="flex flex-wrap gap-x-4 gap-y-2 border-b border-border/50 px-4 pb-4 sm:px-6"
    >
      {SECTIONS.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onJump(s.id)}
          className="cursor-pointer text-[11px] uppercase tracking-widest text-text-muted underline-offset-4 transition-colors hover:text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          {s.label}
        </button>
      ))}
    </nav>
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

/** Shared layout for a named thing with a paragraph under it. Races, classes
 *  and locations are the same shape on the page even though they come from
 *  three different sources. */
function LoreEntry({
  name,
  aside,
  children,
}: {
  name: string
  aside?: string
  children: React.ReactNode
}) {
  return (
    <div className="border-l border-border/60 pl-3">
      <p className="text-sm font-semibold text-text-primary">
        {name}
        {aside && (
          <span className="ml-2 text-xs font-normal text-text-muted">
            {aside}
          </span>
        )}
      </p>
      {children}
    </div>
  )
}

/** Races and classes come from the world registry, not the database — the
 *  same objects the character wizard renders, so the modal cannot drift out
 *  of step with what a player can actually create. */
function PeoplesSection({ worldSlug }: { worldSlug: string }) {
  const races = getWorld(worldSlug).races

  return (
    <section>
      <SectionHeading>Peoples</SectionHeading>
      <div className="flex flex-col gap-4">
        {races.map((race) => (
          <LoreEntry
            key={race.value}
            name={race.label}
            aside={race.genderless ? 'genderless' : undefined}
          >
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {race.description}
            </p>
          </LoreEntry>
        ))}
      </div>
    </section>
  )
}

function TradesSection({ worldSlug }: { worldSlug: string }) {
  const classes = getWorld(worldSlug).classes

  return (
    <section>
      <SectionHeading>Trades</SectionHeading>
      <div className="flex flex-col gap-4">
        {classes.map((cls) => (
          <LoreEntry key={cls.value} name={cls.label}>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {cls.description}
            </p>
            {cls.abilities.length > 0 && (
              // Names only. What each one does is the character sheet's job;
              // here it is a sketch of what this trade is capable of.
              <p
                className="mt-1.5 text-[11px] uppercase tracking-wide text-text-muted"
                style={{ fontFamily: 'var(--font-rajdhani)' }}
              >
                {cls.abilities
                  .filter((a) => a.tier === 1)
                  .map((a) => a.name)
                  .join(' · ')}
              </p>
            )}
          </LoreEntry>
        ))}
      </div>
    </section>
  )
}

function PlacesSection({ locations }: { locations: WorldLore['locations'] }) {
  if (locations.length === 0) return null

  return (
    <section>
      <SectionHeading>Places</SectionHeading>
      <div className="flex flex-col gap-6">
        {locations.map((loc) => (
          <LoreEntry
            key={loc.slug}
            name={loc.name}
            aside={loc.nameTranslation ? `— ${loc.nameTranslation}` : undefined}
          >
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-text-secondary">
              {loc.description}
            </p>
            {loc.subLocations.length > 0 && (
              <ul className="mt-3 flex flex-col gap-2">
                {loc.subLocations.map((sub) => (
                  <li key={sub.name} className="text-sm">
                    <span className="text-text-primary">{sub.name}</span>
                    {sub.nameTranslation && (
                      <span className="text-text-muted">
                        {' '}
                        — {sub.nameTranslation}
                      </span>
                    )}
                    <span className="text-text-secondary">
                      . {sub.description}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </LoreEntry>
        ))}
      </div>
    </section>
  )
}

const CATEGORY_LABELS: Record<GlossaryEntry['category'], string> = {
  magic: 'The Cost',
  history: 'History',
  places: 'Places',
  peoples: 'Peoples',
  powers: 'Trades',
  life: 'Daily Life',
}

const CATEGORY_ORDER: GlossaryEntry['category'][] = [
  'magic',
  'history',
  'places',
  'peoples',
  'powers',
  'life',
]

function GlossarySection({ worldSlug }: { worldSlug: string }) {
  const entries = WORLD_GLOSSARIES[worldSlug]
  if (!entries?.length) return null

  return (
    <section>
      <SectionHeading>Glossary</SectionHeading>
      <div className="flex flex-col gap-5">
        {CATEGORY_ORDER.map((category) => {
          const group = entries.filter((e) => e.category === category)
          if (group.length === 0) return null

          return (
            <div key={category}>
              <p
                className="mb-2 text-[11px] uppercase tracking-widest text-text-muted"
                style={{ fontFamily: 'var(--font-rajdhani)' }}
              >
                {CATEGORY_LABELS[category]}
              </p>
              <dl className="flex flex-col gap-2.5">
                {group.map((entry) => (
                  <div key={entry.term}>
                    <dt className="text-sm font-semibold text-text-primary">
                      {entry.term}
                      {entry.translation && (
                        <span className="ml-2 text-xs font-normal italic text-text-muted">
                          {entry.translation}
                        </span>
                      )}
                    </dt>
                    <dd className="text-sm leading-relaxed text-text-secondary">
                      {entry.definition}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function MapImage({
  worldSlug,
  regionName,
}: {
  worldSlug: string
  regionName: string
}) {
  const maps: Record<string, string> = {
    treigthe: '/images/fantasy/treigthe/maps/treigthe.jpg',
    drift: '/images/sci-fi/drift/maps/drift.jpg',
    neon_warszawa: '/images/cyberpunk/neon-warszawa/maps/neon-warszawa.jpg',
  }
  const src = maps[worldSlug]

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

export default function WorldLoreModal({ genre, lore, trigger }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const titleId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const sectionRefs = useRef<Partial<Record<SectionId, HTMLDivElement | null>>>(
    {}
  )

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
  const jumpTo = useCallback((id: SectionId) => {
    dialogRef.current
      ?.querySelector(`[data-section="${id}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <>
      {trigger ? (
        trigger(() => setIsOpen(true))
      ) : (
        <ModalTrigger name={lore.world.name} onOpen={() => setIsOpen(true)} />
      )}

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
                worldSlug={lore.world.slug}
                regionName={lore.region?.name ?? lore.world.name}
              />
              <div className="pt-4 sm:pt-6">
                <TableOfContents onJump={jumpTo} />
              </div>
              <div className="flex flex-col gap-8 p-4 sm:p-6">
                <div data-section="world" className="scroll-mt-4">
                  <WorldSection publicLore={lore.world.publicLore} />
                  {lore.region && (
                    <div className="mt-8">
                      <RegionSection region={lore.region} />
                    </div>
                  )}
                </div>
                <div data-section="world" className="scroll-mt-4">
                  <TimelineSection events={lore.events} />
                </div>
                <div data-section="peoples" className="scroll-mt-4">
                  <PeoplesSection worldSlug={lore.world.slug} />
                </div>
                <div data-section="trades" className="scroll-mt-4">
                  <TradesSection worldSlug={lore.world.slug} />
                </div>
                <div data-section="places" className="scroll-mt-4">
                  <PlacesSection locations={lore.locations} />
                </div>
                <div data-section="glossary" className="scroll-mt-4">
                  <GlossarySection worldSlug={lore.world.slug} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

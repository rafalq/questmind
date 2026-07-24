import Divider from '@/components/ui/divider'
import { ROUTES } from '@/constants/routes'
import { ENABLED_WORLDS, WORLDS } from '@/worlds'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Worlds · QuestMind',
  description:
    'Explore the three worlds of QuestMind: Tréigthe, The Drift and Neon Warszawa 2087.',
}

// ---------------------------------------------------------------------------
// Only the marketing copy lives here. Everything that also exists in the world
// registry (name, genre, images, races/classes counts, enabled flag) is read
// from `getWorld(slug)` so this page can never contradict what the character
// wizard and the lore modal show — the same rule the lore modal follows.
//
// TODO(counts): `locations` / `npcs` are still hard-coded below. Once the seed
// is the source of truth, replace them with a count query in a server
// component (`select count(*) from locations/npcs where world = slug`).
// ---------------------------------------------------------------------------

const worldCopy: Record<
  (typeof WORLDS)[number]['value'],
  {
    description: string[]
    facts: { label: string; value: string }[]
  }
> = {
  treigthe: {
    description: [
      'A land the gods walked away from. In the grey region of Talamh Liath, three cities cling to old roads and older grudges, and every stranger you meet is carrying something they will not say out loud.',
      'Magic here is paid for, not cast: power costs blood, memory, or something you will not notice missing until later. What you uncover depends entirely on where you look and who you push.',
    ],
    facts: [
      { label: 'Cities', value: '3' },
      { label: 'Glossary', value: '22' },
    ],
  },
  drift: {
    description: [
      'A convoy of ships strung together in the dark, one hundred and thirty cycles after the signal went out. Nothing has answered since. The Veil presses on the hulls, and the crews have long stopped agreeing on what is out there.',
      'Salvage the wrecks the convoy passes, trade favours you cannot repay, and decide how much of the ship you are willing to spend to keep it moving.',
    ],
    facts: [{ label: 'Glossary', value: '17' }],
  },
  neon_warszawa: {
    description: [
      'Warsaw, 2087 — ten years after the net went dark and the city learned to live without it. Chrome towers over the Wisła, back-room implant clinics in Praga, and corporations that own everything except the streets after midnight.',
      'Take jobs from fixers, jack into systems you should not touch, and decide how much of yourself you are willing to trade for an edge.',
    ],
    facts: [{ label: 'Glossary', value: '17' }],
  },
}

type WorldCard = {
  slug: string
  name: string
  genre: string
  image: string
  enabled: boolean
  subtitle: string
  description: string[]
  facts: { label: string; value: string }[]
}

const enabledSlugs = new Set(ENABLED_WORLDS.map((world) => world.value))

const worlds: WorldCard[] = WORLDS.map((world) => {
  // A missing key in `worldCopy` must not take the page down: fall back to the
  // registry's own one-line description and drop the extra facts.
  const copy = worldCopy[world.value] ?? {
    description: [world.description],
    facts: [],
  }

  return {
    slug: world.value,
    name: world.name,
    genre: world.genre,
    image: world.cardImageUrl,
    enabled: enabledSlugs.has(world.value),
    // The registry already carries a one-line `subtitle` and `description`;
    // the long two-paragraph copy for this page lives in `worldCopy` above.
    subtitle: world.subtitle,
    description: copy.description,
    facts: [
      { label: 'Races', value: String(world.races.length) },
      { label: 'Classes', value: String(world.classes.length) },
      ...copy.facts,
    ],
  }
})

export default function WorldsPage() {
  return (
    <>
      <Header />
      <div className="flex flex-col">
        {worlds.map((world, i) => (
          <div key={world.slug}>
            {i > 0 && <Divider />}
            <WorldSection world={world} reversed={i % 2 === 1} />
          </div>
        ))}
      </div>
      <CTA />
    </>
  )
}

// ----- Header -----
function Header() {
  return (
    <section className="px-4 pb-12 pt-24 text-center sm:px-8 sm:pt-28 md:px-12 lg:px-24">
      <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-accent sm:text-xs sm:tracking-[0.4em]">
        The Worlds of QuestMind
      </p>
      <h1 className="mx-auto mb-6 max-w-3xl text-3xl font-bold leading-tight tracking-wide sm:text-4xl md:text-5xl">
        Choose where your story <span className="text-accent">begins</span>
      </h1>
      <p className="font-(family-name:--font-im-fell) mx-auto max-w-2xl text-base italic leading-relaxed text-text-secondary sm:text-lg">
        Each world has its own races, classes, places and secrets. The Game
        Master speaks in its voice — grim in one, cold in another, electric in
        the third.
      </p>
    </section>
  )
}

// ----- World section -----
function WorldSection({
  world,
  reversed,
}: {
  world: WorldCard
  reversed: boolean
}) {
  return (
    <section
      id={world.slug}
      className="scroll-mt-20 px-4 py-16 sm:px-8 sm:py-20 md:px-12 lg:px-24"
    >
      <div
        className={`mx-auto flex max-w-5xl flex-col items-center gap-8 md:gap-12 ${
          reversed ? 'md:flex-row-reverse' : 'md:flex-row'
        }`}
      >
        {/* Image */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-4/3 w-full overflow-hidden border border-border">
            <Image
              src={world.image}
              alt={`${world.name} — ${world.genre}`}
              fill
              className={`object-cover ${world.enabled ? '' : 'grayscale-[0.5]'}`}
              sizes="(min-width: 768px) 512px, 100vw"
            />
            {!world.enabled && (
              <div className="absolute inset-0 flex items-start justify-end bg-black/30 p-4">
                <span className="border border-accent bg-black/70 px-3 py-1.5 text-[10px] tracking-[0.3em] text-accent">
                  COMING SOON
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="w-full text-center md:w-1/2 md:text-left">
          <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-accent sm:text-xs">
            {world.genre}
          </p>
          <h2 className="mb-1 text-2xl font-bold tracking-wide sm:text-3xl">
            {world.name}
          </h2>
          <p className="font-(family-name:--font-im-fell) mb-6 text-base italic text-text-secondary">
            {world.subtitle}
          </p>

          {world.description.map((paragraph, i) => (
            <p
              key={i}
              className="font-(family-name:--font-im-fell) mb-4 text-base italic leading-relaxed text-text-muted"
            >
              {paragraph}
            </p>
          ))}

          {world.facts.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {world.facts.map((fact) => (
                <div
                  key={fact.label}
                  className="border border-border px-3 py-3 text-center"
                >
                  <div className="text-xl font-bold text-accent">
                    {fact.value}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-text-muted">
                    {fact.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// ----- CTA -----
function CTA() {
  return (
    <section className="border-t border-border px-4 py-16 text-center sm:px-8 sm:py-20">
      <h2 className="mb-4 text-2xl font-bold tracking-wide sm:text-3xl md:text-4xl">
        Pick a world. The rest is up to you.
      </h2>
      <p className="font-(family-name:--font-im-fell) mb-8 text-base italic text-text-muted sm:text-lg">
        Create a free account and forge your first character.
      </p>
      <Link
        href={ROUTES.signUp}
        className="inline-block w-full max-w-xs bg-accent px-10 py-4 text-sm font-bold tracking-widest text-accent-fg transition-colors hover:bg-accent-hover sm:w-auto sm:max-w-none"
      >
        BEGIN YOUR QUEST
      </Link>
    </section>
  )
}

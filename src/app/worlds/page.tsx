import Divider from '@/components/ui/divider'
import { ROUTES } from '@/constants/routes'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'Worlds · QuestMind',
  description:
    'Explore the three worlds of QuestMind: Tréigthe, The Drift and Neon Warszawa 2087.',
}

// ---------------------------------------------------------------------------
// Opisy napisałem na podstawie Twoich dokumentów — podmień na fragmenty
// własnego lore (te same teksty co w modalach), żeby wszystko było spójne.
// `status: 'available' | 'coming-soon'` steruje badge'em — jak The Drift
// będzie grywalny, zmień mu status. `facts` to opcjonalne metryki świata.
// ---------------------------------------------------------------------------
type WorldStatus = 'available' | 'coming-soon'

const worlds: {
  slug: string
  name: string
  subtitle: string
  genre: string
  status: WorldStatus
  image: string
  description: string[]
  facts: { label: string; value: string }[]
}[] = [
  {
    slug: 'treigthe',
    name: 'Tréigthe',
    subtitle: 'The Forsaken',
    genre: 'Dark Fantasy',
    status: 'available',
    image: '/images/fantasy/treigthe/fantasy-hero.jpg',
    description: [
      'A land the gods walked away from. In the grey region of Talamh Liath, three cities cling to old roads and older grudges, and every stranger you meet is carrying something they will not say out loud.',
      'Choose from four races and four classes, and step into a world where every NPC guards a hidden secret — one the Game Master will hint at, but never hand you. What you uncover depends entirely on where you look and who you push.',
    ],
    facts: [
      { label: 'Races', value: '4' },
      { label: 'Classes', value: '4' },
      { label: 'Cities', value: '3' },
      { label: 'NPCs', value: '45' },
    ],
  },
  {
    slug: 'the-drift',
    name: 'The Drift',
    subtitle: 'Between the Stars',
    genre: 'Sci-Fi',
    status: 'coming-soon',
    image: '/images/sci-fi/drift/sci-fi-hero.jpg',
    description: [
      'Far from any homeworld, a scattered belt of stations, wrecks and mining outposts drifts through the dark. Out here the law is whatever the nearest airlock says it is, and every contract has a clause nobody read.',
      'Trade, salvage, smuggle or explore — the Drift rewards those who ask the right questions and keep one hand near the throttle.',
    ],
    facts: [],
  },
  {
    slug: 'neon-warszawa-2087',
    name: 'Neon Warszawa 2087',
    subtitle: 'The City That Rebuilt Itself',
    genre: 'Cyberpunk',
    status: 'coming-soon',
    image: '/images/cyberpunk/neon-warszawa/cyberpunk-hero.jpg',
    description: [
      'Warsaw, sixty years from now: chrome towers over the Vistula, black-market implant clinics in Praga, and corporations that own everything except the streets after midnight.',
      'Take jobs from fixers, jack into systems you should not touch, and decide how much of yourself you are willing to trade for an edge.',
    ],
    facts: [],
  },
]

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
  world: (typeof worlds)[number]
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
              className="object-cover"
              sizes="(min-width: 768px) 512px, 100vw"
            />
            {world.status === 'coming-soon' && (
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

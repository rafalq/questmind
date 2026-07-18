import Divider from '@/components/ui/divider'
import { ROUTES } from '@/constants/routes'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'About · QuestMind',
  description:
    'What QuestMind is, how to play, and the worlds you can explore.',
}

// ---------------------------------------------------------------------------
// How to play — kolejność: konto → postać → kampania → gra.
// Podmień `image: null` na ścieżki do prawdziwych screenshotów,
// np. '/images/about/step-2-character.jpg'. Dopóki jest null,
// renderuje się stylowany placeholder w tej samej ramce.
// ---------------------------------------------------------------------------
const steps: {
  number: string
  title: string
  description: string
  image: string | null
  imageAlt: string
}[] = [
  {
    number: 'I',
    title: 'Create your account',
    description:
      'Sign up with your email in seconds. Your campaigns, characters and story history are tied to your account — nothing is ever lost.',
    image: null,
    imageAlt: 'QuestMind sign-up page',
  },
  {
    number: 'II',
    title: 'Forge your character',
    description:
      'Pick a world, choose a race and class, shape your attributes and give your hero a name. Every race comes with its own portrait.',
    image: null,
    imageAlt: 'Character creation wizard — race selection with portraits',
  },
  {
    number: 'III',
    title: 'Start a campaign',
    description:
      'Name your campaign and step into the world you chose. Read the lore before you jump in — the world has secrets worth knowing.',
    image: null,
    imageAlt: 'Campaign dashboard with campaign cards',
  },
  {
    number: 'IV',
    title: 'Play your story',
    description:
      'Type what you want to do. The AI Game Master narrates the outcome while your HP, inventory and quests update on their own.',
    image: null,
    imageAlt: 'Live session — AI narration with the stats panel',
  },
]

const worlds = [
  {
    name: 'Tréigthe',
    tagline: 'The Forsaken · Dark Fantasy',
    image: '/images/fantasy/treigthe/fantasy-hero.jpg',
  },
  {
    name: 'The Drift',
    tagline: 'Sci-Fi',
    image: '/images/sci-fi/drift/sci-fi-hero.jpg',
  },
  {
    name: 'Neon Warszawa 2087',
    tagline: 'Cyberpunk',
    image: '/images/cyberpunk/neon-warszawa/cyberpunk-hero.jpg',
  },
]

export default function AboutPage() {
  return (
    <>
      <Intro />
      <Divider />
      <HowToPlay />
      <Divider />
      <WorldsTeaser />
      <CTA />
    </>
  )
}

// ----- Intro -----
function Intro() {
  return (
    <section className="px-4 pb-16 pt-24 text-center sm:px-8 sm:pt-28 md:px-12 lg:px-24">
      <p className="mb-4 text-[10px] uppercase tracking-[0.3em] text-accent sm:text-xs sm:tracking-[0.4em]">
        About QuestMind
      </p>
      <h1 className="mx-auto mb-6 max-w-3xl text-3xl font-bold leading-tight tracking-wide sm:text-4xl md:text-5xl">
        A Game Master that never <span className="text-accent">sleeps</span>
      </h1>
      <p className="font-(family-name:--font-im-fell) mx-auto max-w-2xl text-base italic leading-relaxed text-text-secondary sm:text-lg">
        Tabletop RPGs usually need a group, a schedule and an experienced Game
        Master. QuestMind needs none of that. An AI narrates your adventure,
        remembers what happened, reacts to any decision you make — and keeps
        your character sheet up to date while you play. All you bring is
        curiosity.
      </p>
    </section>
  )
}

// ----- How to play -----
function HowToPlay() {
  return (
    <section className="px-4 py-16 sm:px-8 sm:py-20 md:px-12 lg:px-24">
      <div className="mb-10 text-center sm:mb-14">
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-accent sm:text-xs sm:tracking-[0.4em]">
          How to play
        </p>
        <h2 className="text-2xl font-bold tracking-wide md:text-3xl">
          From sign-up to first quest
        </h2>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-12 sm:gap-16">
        {steps.map((step, i) => (
          <Step key={step.number} step={step} reversed={i % 2 === 1} />
        ))}
      </div>
    </section>
  )
}

function Step({
  step,
  reversed,
}: {
  step: (typeof steps)[number]
  reversed: boolean
}) {
  return (
    <div
      className={`flex flex-col items-center gap-6 md:gap-10 ${
        reversed ? 'md:flex-row-reverse' : 'md:flex-row'
      }`}
    >
      {/* Screenshot / placeholder */}
      <div className="w-full border border-border bg-bg-surface md:w-1/2">
        <div className="relative aspect-16/10 w-full">
          {step.image ? (
            <Image
              src={step.image}
              alt={step.imageAlt}
              fill
              className="object-cover object-top"
              sizes="(min-width: 768px) 480px, 100vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#201a11]/40 px-6 text-center">
              <span className="text-2xl text-accent" aria-hidden="true">
                ✦
              </span>
              <p className="text-[10px] tracking-[0.3em] text-text-muted sm:text-xs">
                SCREENSHOT — {step.title.toUpperCase()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="w-full text-center md:w-1/2 md:text-left">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center border border-accent/40 font-(family-name:--font-im-fell) text-xl text-accent">
          {step.number}
        </div>
        <h3 className="mb-3 text-lg font-bold tracking-widest sm:text-xl">
          {step.title.toUpperCase()}
        </h3>
        <p className="font-(family-name:--font-im-fell) mx-auto max-w-md text-base italic leading-relaxed text-text-muted md:mx-0">
          {step.description}
        </p>
      </div>
    </div>
  )
}

// ----- Worlds teaser -----
function WorldsTeaser() {
  return (
    <section className="px-4 py-16 sm:px-8 sm:py-20 md:px-12 lg:px-24">
      <div className="mb-10 text-center sm:mb-14">
        <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-accent sm:text-xs sm:tracking-[0.4em]">
          The Worlds
        </p>
        <h2 className="text-2xl font-bold tracking-wide md:text-3xl">
          Three worlds. Countless stories.
        </h2>
      </div>

      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 sm:grid-cols-3 sm:gap-8">
        {worlds.map((world) => (
          <Link
            key={world.name}
            href={ROUTES.worlds}
            className="group border border-border transition-colors hover:border-accent/40"
          >
            <div className="relative aspect-4/5 w-full overflow-hidden">
              <Image
                src={world.image}
                alt={world.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(min-width: 640px) 320px, 100vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-center">
                <h3 className="mb-1 text-lg font-bold tracking-widest">
                  {world.name.toUpperCase()}
                </h3>
                <p className="text-[10px] uppercase tracking-[0.3em] text-accent">
                  {world.tagline}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-center">
        <Link
          href={ROUTES.worlds}
          className="inline-block border border-border px-8 py-3 text-sm tracking-widest text-text-secondary transition-all hover:border-accent hover:text-accent"
        >
          EXPLORE THE WORLDS
        </Link>
      </div>
    </section>
  )
}

// ----- CTA -----
function CTA() {
  return (
    <section className="border-t border-border px-4 py-16 text-center sm:px-8 sm:py-20">
      <h2 className="mb-4 text-2xl font-bold tracking-wide sm:text-3xl">
        Your adventure is one click away
      </h2>
      <Link
        href={ROUTES.signUp}
        className="inline-block w-full max-w-xs bg-accent px-10 py-4 text-sm font-bold tracking-widest text-accent-fg transition-colors hover:bg-accent-hover sm:w-auto sm:max-w-none"
      >
        BEGIN YOUR QUEST
      </Link>
    </section>
  )
}

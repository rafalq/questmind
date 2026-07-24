import CtaSection from '@/components/marketing/cta-section'
import SectionHeader from '@/components/marketing/section-header'
import Divider from '@/components/ui/divider'
import { ROUTES } from '@/constants/routes'
import { WORLDS } from '@/worlds'
import Image from 'next/image'
import Link from 'next/link'

export const metadata = {
  title: 'About · QuestMind',
  description:
    'What QuestMind is, how to play, and the worlds you can explore.',
}

// ---------------------------------------------------------------------------
// How to play — the order mirrors the real flow a new player goes through:
// account → character → campaign → session. Every step is illustrated with a
// screenshot of the actual screen it describes.
// ---------------------------------------------------------------------------

const IMAGE_PREFIX = '/images/about-page/'

const steps: {
  number: string
  title: string
  description: string
  image: string
  imageAlt: string
}[] = [
  {
    number: 'I',
    title: 'Create your account',
    description:
      'Sign up with your email in seconds. Your campaigns, characters and story history are tied to your account — nothing is ever lost.',
    image: `${IMAGE_PREFIX}sign-up.png`,
    imageAlt: 'QuestMind sign-up page',
  },
  {
    number: 'II',
    title: 'Forge your character',
    description:
      'Pick a world, choose a race and class, shape your attributes and give your hero a name. Every race comes with its own portrait.',
    image: `${IMAGE_PREFIX}new-character.png`,
    imageAlt: 'Character creation wizard — race selection with portraits',
  },
  {
    number: 'III',
    title: 'Start a campaign',
    description:
      'Name your campaign and step into the world you chose. Read the lore before you jump in — the world has secrets worth knowing.',
    image: `${IMAGE_PREFIX}new-campaign.png`,
    imageAlt: 'Campaign dashboard with campaign cards',
  },
  {
    number: 'IV',
    title: 'Play your story',
    description:
      'Type what you want to do. The AI Game Master narrates the outcome while your HP, inventory and quests update on their own.',
    image: `${IMAGE_PREFIX}session.png`,
    imageAlt: 'Live session — AI narration with the stats panel',
  },
]

// This teaser links straight to /worlds, so the two pages naming the same
// world differently — or pointing at an image path that has since moved — is
// exactly the drift the registry exists to prevent. Names and artwork are
// therefore read from it, and only the tagline stays here as editorial copy.
// Same rule /worlds already follows for its long-form descriptions.
const worldTaglines: Partial<
  Record<(typeof WORLDS)[number]['value'], string>
> = {
  treigthe: 'The Forsaken · Dark Fantasy',
}

const worlds = WORLDS.map((world) => ({
  name: world.name,
  // The genre alone reads fine for the worlds that have no bespoke tagline.
  tagline: worldTaglines[world.value] ?? world.genre,
  image: world.cardImageUrl,
}))

export default function AboutPage() {
  return (
    <>
      <section className="px-4 pb-16 pt-24 sm:px-8 sm:pt-28 md:px-12 lg:px-24">
        <SectionHeader
          as="h1"
          eyebrow="About QuestMind"
          heading={
            <>
              A Game Master that never{' '}
              <span className="text-accent">sleeps</span>
            </>
          }
          description="Tabletop RPGs usually need a group, a schedule and an experienced Game Master. QuestMind needs none of that. An AI narrates your adventure, remembers what happened, reacts to any decision you make — and keeps your character sheet up to date while you play. All you bring is curiosity."
        />
      </section>
      <Divider />
      <HowToPlay />
      <Divider />
      <WorldsTeaser />
      <CtaSection
        heading="Your adventure is one click away"
        ctaLabel="BEGIN YOUR QUEST"
      />
    </>
  )
}

// ----- How to play -----
function HowToPlay() {
  return (
    <section className="px-4 py-16 sm:px-8 sm:py-20 md:px-12 lg:px-24">
      <SectionHeader
        eyebrow="How to play"
        heading="From sign-up to first quest"
        className="mb-10 sm:mb-14"
      />

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
      {/* Screenshot */}
      <div className="w-full border border-border bg-bg-surface md:w-1/2">
        <div className="relative aspect-16/10 w-full">
          <Image
            src={step.image}
            alt={step.imageAlt}
            fill
            className="object-cover object-top"
            sizes="(min-width: 768px) 480px, 100vw"
          />
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
      <SectionHeader
        eyebrow="The Worlds"
        heading="Three worlds. Countless stories."
        className="mb-10 sm:mb-14"
      />

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

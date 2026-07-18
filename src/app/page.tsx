import Divider from '@/components/ui/divider'
import { ROUTES } from '@/constants/routes'
import { Dices, HeartPulse, ScrollText, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const features: {
  icon: LucideIcon
  title: string
  description: string
}[] = [
  {
    icon: Dices,
    title: 'AI Game Master',
    description:
      'Claude narrates your adventure and tracks every decision. No human GM required — just you and the story.',
  },
  {
    icon: HeartPulse,
    title: 'Live Character Stats',
    description:
      'HP, gold, inventory and quest flags update in real time as the story unfolds. No spreadsheets.',
  },
  {
    icon: ScrollText,
    title: 'Persistent Campaigns',
    description:
      'Save your session and return where you left off. Your choices shape a world that remembers you.',
  },
]

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Divider />
      <Demo />
      <CTA />
    </>
  )
}

// ----- Hero -----
const heroImages = [
  '/images/fantasy/treigthe/fantasy-hero.jpg',
  '/images/sci-fi/drift/sci-fi-hero.jpg',
  '/images/cyberpunk/neon-warszawa/cyberpunk-hero.jpg',
]

function Hero() {
  return (
    <section className="relative flex min-h-svh flex-col items-center overflow-hidden px-4 text-center sm:px-6">
      {/* Three-strip image background */}
      <div className="absolute inset-0 flex flex-col">
        {heroImages.map((src) => (
          <div
            key={src}
            className={`relative flex-1 bg-cover ${src == '/images/fantasy/treigthe/fantasy-hero.jpg' ? 'bg-top' : 'bg-center'}`}
            style={{ backgroundImage: `url("${src}")` }}
          />
        ))}
      </div>

      {/* Overlay across all three */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Hero text */}
      <div className="relative z-10 flex h-full min-h-svh flex-col items-center justify-center py-24 text-center">
        <p className="mb-6 border border-accent px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-accent sm:px-4 sm:text-xs sm:tracking-[0.4em]">
          AI-Powered Tabletop RPG
        </p>
        <h1 className="mb-6 max-w-4xl text-4xl font-bold leading-tight tracking-wide sm:text-5xl md:text-6xl lg:text-7xl">
          Your Story, <span className="text-accent">Told by AI</span>
        </h1>
        <p className="mb-10 max-w-xl text-base italic leading-relaxed text-text-secondary sm:text-lg md:text-xl">
          QuestMind is an AI Game Master that narrates your adventure, tracks
          your character, and adapts to every choice you make.
        </p>
        <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          <Link
            href={ROUTES.signUp}
            className="w-full max-w-xs bg-accent px-8 py-3 text-center text-sm font-bold tracking-widest text-accent-fg transition-colors hover:bg-accent-hover sm:w-auto sm:max-w-none"
          >
            BEGIN YOUR QUEST
          </Link>
          <a
            href="#demo"
            className="w-full max-w-xs border border-border px-8 py-3 text-center text-sm tracking-widest text-text-secondary transition-all hover:border-accent hover:text-accent sm:w-auto sm:max-w-none"
          >
            SEE IT IN ACTION
          </a>
        </div>
      </div>
    </section>
  )
}

// ----- Features -----
function Features() {
  return (
    <section className="grid grid-cols-1 gap-6 px-4 py-16 sm:px-8 sm:gap-8 sm:py-20 md:grid-cols-3 md:px-12 lg:px-24">
      {features.map((f) => (
        <Feature
          key={f.title}
          icon={f.icon}
          title={f.title}
          description={f.description}
        />
      ))}
    </section>
  )
}

function Feature({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <div className="group border border-border p-6 transition-colors hover:border-accent/40 sm:p-8">
      <div className="mb-4 flex items-center gap-4">
        <div className="mb-5 inline-flex h-12 w-12 items-center justify-center border border-accent/30 text-accent transition-colors group-hover:border-accent">
          <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <h3 className="mb-3 text-base font-bold tracking-widest">
          {title.toUpperCase()}
        </h3>
      </div>
      <p className="font-(family-name:--font-im-fell) text-base italic leading-relaxed text-text-muted transition-colors group-hover:text-text-secondary">
        {description}
      </p>
    </div>
  )
}

// ----- Demo -----

// Podmień na prawdziwy zrzut ekranu sesji, np. '/images/demo/session-preview.jpg'.
// Dopóki jest null, sekcja renderuje stylowany placeholder.
const DEMO_IMAGE: string | null = null

function Demo() {
  return (
    <section
      id="demo"
      className="flex scroll-mt-20 flex-col items-center justify-center px-4 pb-20 pt-12 sm:px-8 sm:pb-24 md:px-12 lg:px-24"
    >
      <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-accent sm:text-xs sm:tracking-[0.4em]">
        Live Session Demo
      </p>
      <h2 className="mb-8 text-center text-2xl font-bold tracking-wide sm:mb-10 md:text-3xl">
        What a session looks like
      </h2>

      <div className="w-full max-w-3xl border border-border bg-bg-surface">
        {/* Terminal bar */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#8a3a1a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#6a6a1a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#1a5a2a]" />
          <span className="ml-3 truncate text-[10px] tracking-widest text-text-muted sm:text-xs">
            THE BROKEN FLAGON TAVERN · SESSION 1
          </span>
        </div>

        {/* Screenshot / placeholder */}
        <div className="relative aspect-16/10 w-full">
          {DEMO_IMAGE ? (
            <Image
              src={DEMO_IMAGE}
              alt="QuestMind live session — AI Game Master narration with the stats panel updating in real time"
              fill
              className="object-cover object-top"
              sizes="(min-width: 768px) 768px, 100vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border-t-0 bg-[#201a11]/40 px-6 text-center">
              <span className="text-3xl text-accent" aria-hidden="true">
                ⚔
              </span>
              <p className="text-xs tracking-[0.3em] text-text-muted">
                SESSION SCREENSHOT
              </p>
              <p className="font-(family-name:--font-im-fell) max-w-sm text-sm italic text-text-muted">
                A preview of a live QuestMind session will appear here.
              </p>
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
        Ready to play?
      </h2>
      <p className="font-(family-name:--font-im-fell) mb-8 text-base italic text-text-muted sm:text-lg">
        Create a free account and start your first campaign in minutes.
      </p>
      <Link
        href={ROUTES.signUp}
        className="inline-block w-full max-w-xs bg-accent px-10 py-4 text-sm font-bold tracking-widest text-accent-fg transition-colors hover:bg-accent-hover sm:w-auto sm:max-w-none"
      >
        CREATE FREE ACCOUNT
      </Link>
    </section>
  )
}

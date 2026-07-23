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
    // on-media is the fix for the light theme here: every layer of this
    // section sits on photography that stays dark in both themes, so the text
    // tokens have to stay light. Without it the subheading resolved to the
    // light theme's dark brown and disappeared into the artwork.
    //
    // One min-h-svh, not two: the inner wrapper repeated it and added py-24 on
    // top, which made the hero taller than the viewport and pushed the CTA
    // buttons below the fold — visible in the light-theme screenshot as a
    // third image strip cut in half behind the buttons.
    <section className="on-media relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-24 text-center sm:px-6">
      {/* Three-strip image background */}
      <div className="absolute inset-0 flex flex-col">
        {heroImages.map((src, i) => (
          <div
            key={src}
            // The fantasy plate has its subject near the top; the other two
            // are centred. Index rather than a string comparison against the
            // path, which broke silently whenever a filename changed.
            className={`relative flex-1 bg-cover ${i === 0 ? 'bg-top' : 'bg-center'}`}
            style={{ backgroundImage: `url("${src}")` }}
          />
        ))}
      </div>

      {/* Scrim across all three. Reads the same token the cards use, so the
          dimming of artwork is tuned in one place per theme. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: 'rgb(var(--qm-image-overlay, 0 0 0 / 0.72))',
        }}
      />

      {/* Hero text */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <p className="mb-6 border border-accent px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-accent sm:px-4 sm:text-xs sm:tracking-[0.4em]">
          AI-Powered Tabletop RPG
        </p>
        <h1 className="mb-6 max-w-4xl text-4xl font-bold leading-tight tracking-wide sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="text-text-primary">Your Story, </span>
          <span className="text-accent">Told by AI</span>
        </h1>
        <p className="mb-10 max-w-xl text-base italic leading-relaxed text-text-secondary sm:text-lg md:text-xl">
          QuestMind is an AI Game Master that narrates your adventure, tracks
          your character, and adapts to every choice you make.
        </p>
        <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          {/* Was #c9a74a on #0a0805 — the dark theme's accent, hardcoded, so
              the button ignored the theme like everything else on this page. */}
          <Link
            href={ROUTES.signUp}
            className="w-full max-w-xs bg-accent px-8 py-3 text-center text-sm font-bold tracking-widest text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto sm:max-w-none"
          >
            BEGIN YOUR QUEST
          </Link>
          {/* `border` on its own inherits currentColor in Tailwind v4, which
              made the outline track the text colour by accident. Stated. */}
          <a
            href="#demo"
            className="w-full max-w-xs border border-border px-8 py-3 text-center text-sm tracking-widest text-text-secondary transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto sm:max-w-none"
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
    <section className="grid grid-cols-1 gap-6 px-4 py-16 sm:gap-8 sm:px-8 sm:py-20 md:grid-cols-3 md:px-12 lg:px-24">
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
      {/* The icon box carried mb-5 and the heading mb-3 inside a flex row that
          centres them — both margins fought the alignment for no visible gain. */}
      <div className="mb-4 flex items-center gap-4">
        <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center border border-accent/40 text-accent transition-colors group-hover:border-accent">
          <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <h3 className="text-base font-bold tracking-widest text-text-primary">
          {title.toUpperCase()}
        </h3>
      </div>
      <p className="font-(family-name:--font-im-fell) text-base italic leading-relaxed text-text-secondary transition-colors group-hover:text-text-primary">
        {description}
      </p>
    </div>
  )
}

// ----- Demo -----

// Podmień na prawdziwy zrzut ekranu sesji, np. '/images/demo/session-preview.jpg'.
// Dopóki jest null, sekcja renderuje stylowany placeholder.
const DEMO_IMAGE: string | null = '/images/home-page/demo-v2.png'
const DEMO_SESSION_NAME = 'The Light That Should Not Be'

function Demo() {
  return (
    <section
      id="demo"
      className="flex scroll-mt-20 flex-col items-center justify-center px-4 pb-20 pt-12 sm:px-8 sm:pb-24 md:px-12 lg:px-24"
    >
      <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-accent sm:text-xs sm:tracking-[0.4em]">
        Live Session Demo
      </p>
      <h2 className="mb-8 text-center text-2xl font-bold tracking-wide text-text-primary sm:mb-10 md:text-3xl">
        What a session looks like
      </h2>

      <div className="w-full max-w-3xl border border-border bg-bg-surface">
        {/* Terminal bar. The three dots stay literal colours on purpose — they
            imitate a window chrome, not part of the palette. */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#8a3a1a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#6a6a1a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#1a5a2a]" />
          <span className="ml-3 truncate text-[10px] tracking-widest text-text-muted sm:text-xs">
            {DEMO_SESSION_NAME} · SESSION 1
          </span>
        </div>

        {/* Screenshot / placeholder */}
        <div className="relative aspect-16/10 w-full overflow-hidden">
          {DEMO_IMAGE ? (
            <Image
              src={DEMO_IMAGE}
              alt="QuestMind live session — AI Game Master narration with the stats panel updating in real time"
              fill
              quality={92}
              className="object-contain"
              sizes="(min-width: 768px) 768px, 100vw"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-bg-elevated px-6 text-center">
              <span className="text-3xl text-accent" aria-hidden="true">
                ⚔
              </span>
              <p className="text-xs tracking-[0.3em] text-text-secondary">
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
      <h2 className="mb-4 text-2xl font-bold tracking-wide text-text-primary sm:text-3xl md:text-4xl">
        Ready to play?
      </h2>
      <p className="font-(family-name:--font-im-fell) mb-8 text-base italic text-text-secondary sm:text-lg">
        Create a free account and start your first campaign in minutes.
      </p>
      <Link
        href={ROUTES.signUp}
        className="inline-block w-full max-w-xs bg-accent px-10 py-4 text-sm font-bold tracking-widest text-accent-fg transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-auto sm:max-w-none"
      >
        CREATE FREE ACCOUNT
      </Link>
    </section>
  )
}

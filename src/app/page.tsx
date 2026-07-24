import CtaSection from '@/components/marketing/cta-section'
import SectionEyebrow from '@/components/marketing/section-eyebrow'
import SectionHeader from '@/components/marketing/section-header'
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
      <CtaSection
        heading="Ready to play?"
        description="Create a free account and start your first campaign in minutes."
        ctaLabel="CREATE FREE ACCOUNT"
      />
    </>
  )
}

// ----- Hero -----
// TODO(registry): these three paths duplicate the world registry the same way
// the About teaser used to. They are left literal only because the registry
// exposes `cardImageUrl`, which is the card crop, not this landscape plate.
// Add a `heroImageUrl` to the registry and read them from there.
const heroImages = [
  '/images/fantasy/treigthe/fantasy-hero.jpg',
  '/images/sci-fi/drift/sci-fi-hero.jpg',
  '/images/cyberpunk/neon-warszawa/cyberpunk-hero.jpg',
]

function Hero() {
  return (
    // on-media is the fix for the light theme here: every layer of this
    // section sits on photography that stays dark in both themes, so the text
    // tokens have to stay light. Without it the subheading resolves to the
    // light theme's dark brown and disappears into the artwork.
    //
    // One min-h-svh, not two: repeating it on the inner wrapper and adding
    // py-24 on top made the hero taller than the viewport and pushed the CTA
    // buttons below the fold.
    <section className="on-media relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-4 py-24 text-center sm:px-6">
      {/* Three-strip image background */}
      <div className="absolute inset-0 flex flex-col">
        {heroImages.map((src, i) => (
          <div
            key={src}
            // The fantasy plate has its subject near the top; the other two
            // are centred. Keyed on index rather than a string comparison
            // against the path, which breaks silently when a filename changes.
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
        <SectionEyebrow boxed className="mb-6">
          AI-Powered Tabletop RPG
        </SectionEyebrow>
        <h1 className="mb-6 max-w-4xl text-4xl font-bold leading-tight tracking-wide sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="text-text-primary">Your Story, </span>
          <span className="text-accent">Told by AI</span>
        </h1>
        <p className="mb-10 max-w-xl text-base italic leading-relaxed text-text-secondary sm:text-lg md:text-xl">
          QuestMind is an AI Game Master that narrates your adventure, tracks
          your character, and adapts to every choice you make.
        </p>
        <div className="flex w-full flex-col items-center justify-center gap-4 sm:w-auto sm:flex-row">
          {/* Accent tokens, not literals: this button used to hardcode the
              dark theme's #c9a74a on #0a0805 and so ignored the theme. */}
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

const DEMO_IMAGE = '/images/home-page/demo-v2.png'
const DEMO_SESSION_NAME = 'The Light That Should Not Be'

function Demo() {
  return (
    <section
      id="demo"
      className="flex scroll-mt-20 flex-col items-center justify-center px-4 pb-20 pt-12 sm:px-8 sm:pb-24 md:px-12 lg:px-24"
    >
      <SectionHeader
        eyebrow="Live Session Demo"
        heading="What a session looks like"
        className="mb-8 sm:mb-10"
      />

      <div className="w-full max-w-3xl border border-border bg-bg-surface">
        {/* Terminal bar. The three dots stay literal colours on purpose — they
            imitate window chrome, not part of the palette. */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3 sm:px-5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#8a3a1a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#6a6a1a]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#1a5a2a]" />
          <span className="ml-3 truncate text-[10px] tracking-widest text-text-muted sm:text-xs">
            {DEMO_SESSION_NAME} · SESSION 1
          </span>
        </div>

        {/* Screenshot */}
        <div className="relative aspect-16/10 w-full overflow-hidden">
          <Image
            src={DEMO_IMAGE}
            alt="QuestMind live session — AI Game Master narration with the stats panel updating in real time"
            fill
            quality={92}
            className="object-contain"
            sizes="(min-width: 768px) 768px, 100vw"
          />
        </div>
      </div>
    </section>
  )
}

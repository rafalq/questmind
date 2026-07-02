import Divider from '@/components/ui/divider'
import { ROUTES } from '@/constants/routes'
import Link from 'next/link'

const features = [
  {
    icon: '✦',
    title: 'AI Game Master',
    description:
      'Claude narrates your adventure and tracks every decision. No human GM required — just you and the story.',
  },
  {
    icon: '⚔',
    title: 'Live Character Stats',
    description:
      'HP, gold, inventory and quest flags update in real time as the story unfolds. No spreadsheets.',
  },
  {
    icon: '📜',
    title: 'Persistent Campaigns',
    description:
      'Save your session and return where you left off. Your choices shape a world that remembers you.',
  },
]

const demoMessages = [
  {
    role: 'gm',
    text: 'You push open the heavy tavern door. The smell of ale and woodsmoke fills your lungs. A cloaked figure in the corner catches your eye — they seem to be watching you.',
  },
  {
    role: 'player',
    text: 'I walk over to the cloaked figure and sit across from them. "I heard you might have work for someone like me."',
  },
  {
    role: 'gm',
    text: 'The figure leans forward, revealing sharp elven features beneath the hood. "Word travels fast," she says, sliding a rolled parchment across the table. "The job pays 500 gold — if you survive."',
  },
  {
    role: 'player',
    text: 'I unroll the parchment and read it.',
  },
  {
    role: 'gm',
    text: 'The parchment shows a hand-drawn map of the Blackwood Forest, with a red mark deep in its heart. Beneath it: "Recover the Ember Seal. Do not open it." Your HP: 24/24 · Gold: 12 · Quest accepted.',
  },
]

export default function HomePage() {
  return (
    <>
      <Hero />
      <Divider />
      <Features />
      <Demo />
      <CTA />
    </>
  )
}

// ----- Hero -----
function Hero() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center text-center px-6 pt-24 pb-20"
      style={{
        backgroundImage: 'url("/images/fantasy/treigthe/fantasy-hero.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Hero text */}
      <div className="relative flex flex-col items-center justify-center z-10 text-center">
        <p className="text-xs tracking-[0.4em] text-accent mb-6 uppercase border border-accent px-4 py-2">
          AI-Powered Tabletop RPG
        </p>
        <h1 className="text-5xl md:text-7xl font-bold tracking-wide leading-tight mb-6 max-w-4xl">
          Your Story, <span className="text-accent">Told by AI</span>
        </h1>
        <p
          className="
       text-xl text-text-secondary max-w-xl mb-10 leading-relaxed italic"
        >
          QuestMind is an AI Game Master that narrates your adventure, tracks
          your character, and adapts to every choice you make.
        </p>
        <div className="flex flex-col justify-center items-center sm:flex-row gap-4">
          <Link
            href={ROUTES.signUp}
            className="px-8 py-3 bg-accent text-accent-fg font-bold tracking-widest text-sm hover:bg-accent-hover transition-colors"
          >
            BEGIN YOUR QUEST
          </Link>

          <a
            href="#demo"
            className="px-8 py-3 border border-border text-text-secondary text-sm tracking-widest hover:border-accent hover:text-accent transition-all"
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
    <section className="px-8 md:px-24 py-20 grid grid-cols-1 md:grid-cols-3 gap-8">
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
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="border border-border p-8 hover:border-accent/40 transition-colors group">
      <div className="text-accent text-2xl mb-4">{icon}</div>
      <h3 className="text-base tracking-widest mb-3 font-bold">
        {title.toUpperCase()}
      </h3>
      <p className="font-(family-name:--font-im-fell) text-text-muted text-base leading-relaxed italic group-hover:text-text-secondary transition-colors">
        {description}
      </p>
    </div>
  )
}

// ----- Demo -----
function Demo() {
  return (
    <section
      id="demo"
      className="px-8 md:px-24 pb-24 flex flex-col justify-center items-center"
    >
      <p className="text-xs tracking-[0.4em] text-accent mb-3 uppercase">
        Live Session Demo
      </p>
      <h2 className="text-2xl md:text-3xl font-bold tracking-wide mb-10">
        What a session looks like
      </h2>

      <div className="border border-border bg-bg-surface max-w-2xl w-full">
        {/* Terminal bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
          <span className="w-2.5 h-2.5 rounded-full bg-[#8a3a1a]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#6a6a1a]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#1a5a2a]" />
          <span className="ml-3 text-xs text-text-muted tracking-widest">
            THE BROKEN FLAGON TAVERN · SESSION 1
          </span>
        </div>

        {/* Messages */}
        <div className="p-6 flex flex-col gap-5">
          {demoMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 items-start ${msg.role === 'player' ? 'flex-row-reverse' : ''}`}
            >
              <div className="shrink-0 w-7 h-7 flex items-center justify-center border border-border text-xs text-accent">
                {msg.role === 'gm' ? '⚔' : '◈'}
              </div>
              <div
                className={`max-w-sm px-4 py-3 text-sm leading-relaxed font-(family-name:--font-im-fell) italic border border-border ${
                  msg.role === 'gm'
                    ? 'bg-[#201a11] text-[#c8b88a]'
                    : 'bg-bg-surface text-text-muted text-right'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        {/* Input bar */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 border border-border px-4 py-3">
            <span className="text-text-muted text-xs tracking-widest flex-1">
              What do you do next?
            </span>
            <span className="text-accent text-xs">↵</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ----- CTA -----
function CTA() {
  return (
    <section className="border-t border-border px-8 py-20 text-center">
      <h2 className="text-3xl md:text-4xl font-bold tracking-wide mb-4">
        Ready to play?
      </h2>
      <p className="font-(family-name:--font-im-fell) text-text-muted italic text-lg mb-8">
        Create a free account and start your first campaign in minutes.
      </p>
      <Link
        href={ROUTES.signUp}
        className="inline-block px-10 py-4 bg-accent text-accent-fg font-bold tracking-widest text-sm hover:bg-accent-hover transition-colors"
      >
        CREATE FREE ACCOUNT
      </Link>
    </section>
  )
}

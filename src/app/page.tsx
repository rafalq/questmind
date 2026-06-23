import Divider from '@/components/ui/divider'
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
      {/* Hero */}
      <Hero />

      {/* Divider */}
      <Divider />

      {/* Features */}
      <Features />

      {/* Demo */}
      <Demo />

      {/* CTA */}
      <CTA />
    </>
  )
}

// ----- Hero -----
function Hero() {
  return (
    <section className="flex flex-col items-center text-center px-6 pt-24 pb-20">
      <p className="text-xs tracking-[0.4em] text-[#c9a84c] mb-6 uppercase border border-[#c9a84c] px-4 py-2">
        AI-Powered Tabletop RPG
      </p>
      <h1 className="text-5xl md:text-7xl font-bold tracking-wide leading-tight mb-6 max-w-4xl">
        Your Story, <span className="text-[#c9a84c]">Told by AI</span>
      </h1>
      <p className="font-[family-name:var(--font-im-fell)] text-xl text-[#a89878] max-w-xl mb-10 leading-relaxed italic">
        QuestMind is an AI Game Master that narrates your adventure, tracks your
        character, and adapts to every choice you make.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/sign-up"
          className="px-8 py-3 bg-[#c9a84c] text-[#0a0805] font-bold tracking-widest text-sm hover:bg-[#debb6a] transition-colors"
        >
          BEGIN YOUR QUEST
        </Link>
        <a
          href="#demo"
          className="px-8 py-3 border border-[#3a2e18] text-[#a89060] text-sm tracking-widest hover:border-[#c9a84c] hover:text-[#c9a84c] transition-all"
        >
          SEE IT IN ACTION
        </a>
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
    <div
      key={title}
      className="border border-[#2a2016] p-8 hover:border-[#c9a84c]/40 transition-colors group"
    >
      <div className="text-[#c9a84c] text-2xl mb-4">{icon}</div>
      <h3 className="text-base tracking-widest mb-3 font-bold">
        {title.toUpperCase()}
      </h3>
      <p className="font-[family-name:var(--font-im-fell)] text-[#7a6a50] text-base leading-relaxed italic group-hover:text-[#a89878] transition-colors">
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
      <p className="text-xs tracking-[0.4em] text-[#c9a84c] mb-3 uppercase">
        Live Session Demo
      </p>
      <h2 className="text-2xl md:text-3xl font-bold tracking-wide mb-10">
        What a session looks like
      </h2>

      <div className="border border-[#2a2016] bg-[#0d0b07] max-w-2xl">
        {/* Terminal bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#2a2016]">
          <span className="w-2.5 h-2.5 rounded-full bg-[#3a2016]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#2a2616]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#1a2416]" />
          <span className="ml-3 text-xs text-[#3a3020] tracking-widest">
            THE BROKEN FLAGON TAVERN · SESSION 1
          </span>
        </div>

        {/* Messages */}
        <div className="p-6 flex flex-col gap-5">
          {demoMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'player' ? 'flex-row-reverse' : ''}`}
            >
              <div className="shrink-0 w-7 h-7 flex items-center justify-center border border-[#2a2016] text-xs text-[#c9a84c]">
                {msg.role === 'gm' ? '⚔' : '◈'}
              </div>
              <div
                className={`max-w-sm px-4 py-3 text-sm leading-relaxed font-[family-name:var(--font-im-fell)] italic ${
                  msg.role === 'gm'
                    ? 'bg-[#130f08] text-[#c8b88a] border border-[#2a2016]'
                    : 'bg-[#1a1508] text-[#8a7a5a] border border-[#2a2016] text-right'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input bar */}
        <div className="px-6 pb-6">
          <div className="flex items-center gap-3 border border-[#2a2016] px-4 py-3">
            <span className="text-[#3a3020] text-xs tracking-widest flex-1">
              What do you do next?
            </span>
            <span className="text-[#c9a84c] text-xs">↵</span>
          </div>
        </div>
      </div>
    </section>
  )
}

// ----- CTA -----
function CTA() {
  return (
    <section className="border-t border-[#2a2016] px-8 py-20 text-center">
      <h2 className="text-3xl md:text-4xl font-bold tracking-wide mb-4">
        Ready to play?
      </h2>
      <p className="font-[family-name:var(--font-im-fell)] text-[#7a6a50] italic text-lg mb-8">
        Create a free account and start your first campaign in minutes.
      </p>
      <Link
        href="/sign-up"
        className="inline-block px-10 py-4 bg-[#c9a84c] text-[#0a0805] font-bold tracking-widest text-sm hover:bg-[#debb6a] transition-colors"
      >
        CREATE FREE ACCOUNT
      </Link>
    </section>
  )
}

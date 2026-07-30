import Link from 'next/link'
import {
  IconCheck,
  IconWorld,
  IconUserPlus,
  IconPlayerPlay,
} from '@tabler/icons-react'
import { ROUTES } from '@/constants/routes'

type Props = {
  // Both counts optional: when supplied (dashboard onboarding) the steps show
  // progress — a tick on what's done, the next step highlighted. When omitted
  // (the Getting Started modal, which may open from a navbar with no data to
  // hand) they render as a plain numbered reference.
  campaignCount?: number
  characterCount?: number
}

type StepState = 'done' | 'current' | 'upcoming' | 'neutral'

function Badge({ state, n }: { state: StepState; n: number }) {
  const byState: Record<StepState, string> = {
    done: 'border-accent bg-accent text-accent-fg',
    current: 'border-accent text-accent',
    upcoming: 'border-border text-text-muted',
    neutral: 'border-border text-text-secondary',
  }
  return (
    <div
      className={`grid size-9 shrink-0 place-items-center border text-sm font-semibold ${byState[state]}`}
      style={{ fontFamily: 'var(--font-rajdhani)' }}
    >
      {state === 'done' ? <IconCheck size={18} /> : n}
    </div>
  )
}

export default function HowToStart({ campaignCount, characterCount }: Props) {
  const adaptive = campaignCount !== undefined && characterCount !== undefined
  const hasCampaign = (campaignCount ?? 0) > 0
  const hasCharacter = (characterCount ?? 0) > 0

  // Step 3 is a terminal action (playing is ongoing), so it never ticks — it
  // just lights up as 'current' once the first two are done.
  const stepStates: StepState[] = adaptive
    ? [
        hasCampaign ? 'done' : 'current',
        hasCharacter ? 'done' : hasCampaign ? 'current' : 'upcoming',
        hasCampaign && hasCharacter ? 'current' : 'upcoming',
      ]
    : ['neutral', 'neutral', 'neutral']

  const steps = [
    {
      icon: IconWorld,
      title: 'Create a campaign',
      cta: { href: ROUTES.newCampaign, label: 'New campaign' },
      body: (
        <>
          Pick one of three worlds — Tréigthe, The Drift, or Neon Warszawa 2087
          — and give the campaign a name. Each world has its own peoples, trades
          and map; open its lore from the card to read about it first.
        </>
      ),
    },
    {
      icon: IconUserPlus,
      title: 'Create a character',
      cta: { href: ROUTES.newCharacter, label: 'New character' },
      body: (
        <>
          Run the wizard and{' '}
          <strong className="font-semibold text-text-primary">
            choose the same world as your campaign
          </strong>
          , then work through race, sex, class, attributes, and a name on the
          summary. The genderless Demigod skips the sex step.
        </>
      ),
    },
    {
      icon: IconPlayerPlay,
      title: 'Play',
      cta: null,
      body: (
        <>
          Press Play on the campaign card and choose a character — one from{' '}
          <strong className="font-semibold text-text-primary">
            that campaign&rsquo;s world
          </strong>{' '}
          that isn&rsquo;t{' '}
          <strong className="font-semibold text-text-primary">
            already in another active game
          </strong>
          . Then just type what your character does — there are no menus to
          learn.
        </>
      ),
    },
  ]

  return (
    <div>
      <p className="mb-6 text-sm leading-relaxed text-text-secondary">
        A campaign is a world and its story; a character is who you play as
        inside it. Three steps take you from here to your first turn.
      </p>

      <ol className="flex flex-col">
        {steps.map((step, i) => {
          const state = stepStates[i]
          const Icon = step.icon
          const isLast = i === steps.length - 1
          const showCta = step.cta && state !== 'done'
          return (
            <li key={step.title} className="flex gap-4">
              {/* Badge + connector rail. The rail grows to fill a tall body,
                  so the line always reaches the next badge at any width. */}
              <div className="flex flex-col items-center">
                <Badge state={state} n={i + 1} />
                {!isLast && <div className="mt-2 w-px flex-1 bg-border" />}
              </div>

              <div className={isLast ? '' : 'pb-6'}>
                <h4 className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <Icon
                    size={15}
                    className={
                      state === 'upcoming' ? 'text-text-muted' : 'text-accent'
                    }
                  />
                  {step.title}
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-text-secondary">
                  {step.body}
                </p>
                {showCta && step.cta && (
                  <Link
                    href={step.cta.href}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-accent underline-offset-4 transition-colors hover:text-accent-hover hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                  >
                    {step.cta.label} →
                  </Link>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

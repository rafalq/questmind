import HowToStart from './how-to-start'

// Same user-scoped queries the list servers use. Both read the Clerk userId
// themselves. Note the two disagree on the no-auth path — getCampaigns throws,
// getCharacters returns [] — but this route sits behind Clerk + connection()
// in layout.tsx, so userId is always present; a throw would only bubble to the
// Suspense fallback (null), hiding the guide silently, which is fine here.
import { getCampaigns } from '@/features/campaign/queries/get-campaigns'
import { getCharacters } from '@/features/character/queries/get-characters'

// Streams at the top of the dashboard behind its own Suspense boundary, like
// the two lists below it. Self-removing onboarding aid — no dismissable state
// to persist.
//
// Hide condition is "has played", NOT "has a campaign and a character": the
// previous condition hid the guide the instant both existed, which is exactly
// when step 3 (Play) becomes the next action — so it vanished right before the
// step the user still hadn't taken. We now keep it until at least one campaign
// has actually been played, i.e. has a non-null lastPlayedAt. That's the
// source of truth behind the card's "Never played" label; we check the date,
// not the rendered string.
//
// The counts are still passed through so steps 1 and 2 show their ticks.
export default async function OnboardingServer() {
  const [campaigns, characters] = await Promise.all([
    getCampaigns(),
    getCharacters(),
  ])

  const hasPlayed = campaigns.some((c) => c.lastPlayedAt != null)
  if (hasPlayed) return null

  return (
    <section className="mb-10 border border-border bg-bg-elevated p-4 sm:p-6">
      <p
        className="mb-4 text-xs uppercase tracking-widest text-text-secondary"
        style={{ fontFamily: 'var(--font-rajdhani)' }}
      >
        New here — how to start
      </p>
      <HowToStart
        campaignCount={campaigns.length}
        characterCount={characters.length}
      />
    </section>
  )
}

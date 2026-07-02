import { getCampaigns } from '@/features/campaign/queries/get-campaigns'
import { getActiveSession } from '@/features/session/queries/get-active-session'
import { getAvailableCharacters } from '@/features/session/queries/get-available-characters'
import { getWorldLore } from '@/features/lore/queries/get-world-lore'
import CampaignListClient from './campaign-list-client'
import type { Genre } from '@/features/character/constants/TO-DELETE-constants'

export default async function CampaignListServer() {
  const campaigns = await getCampaigns()

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-24 text-text-muted border border-border">
        <p className="text-lg">No campaigns yet.</p>
        <p className="text-sm mt-2">Create your first campaign to begin.</p>
      </div>
    )
  }

  // Deduplicate genres so we fetch each world lore only once
  const uniqueGenres = [...new Set(campaigns.map((c) => c.genre))] as Genre[]
  const loreMap = Object.fromEntries(
    await Promise.all(
      uniqueGenres.map(async (genre) => [genre, await getWorldLore(genre)])
    )
  )

  const enriched = await Promise.all(
    campaigns.map(async (campaign) => {
      const [activeSession, availableCharacters] = await Promise.all([
        getActiveSession(campaign.id),
        getAvailableCharacters(campaign.genre),
      ])
      return {
        campaign,
        activeSession,
        availableCharacters,
        lore: loreMap[campaign.genre],
      }
    })
  )

  return <CampaignListClient enriched={enriched} />
}

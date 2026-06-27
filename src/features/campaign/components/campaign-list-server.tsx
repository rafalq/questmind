import { getCampaigns } from '@/features/campaign/queries/get-campaigns'
import { getActiveSession } from '@/features/session/queries/get-active-session'
import { getAvailableCharacters } from '@/features/session/queries/get-available-characters'
import CampaignListClient from './campaign-list-client'

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

  // Fetch session and character data for each campaign in parallel
  const enriched = await Promise.all(
    campaigns.map(async (campaign) => {
      const [activeSession, availableCharacters] = await Promise.all([
        getActiveSession(campaign.id),
        getAvailableCharacters(campaign.genre),
      ])
      return { campaign, activeSession, availableCharacters }
    })
  )

  return <CampaignListClient enriched={enriched} />
}

import DashboardSection from '@/components/common/dashboard-section'
import CampaignListSkeleton from '@/components/ui/loader/skeleton/campaign-list-skeleton'
import CharacterListSkeleton from '@/components/ui/loader/skeleton/character-list-skeleton'
import { ROUTES } from '@/constants/routes'
import CampaignListServer from '@/features/campaign/components/campaign-list-server'
import CharacterListServer from '@/features/character/components/display/character-list-server'
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <>
      {/* Each list streams in behind its own boundary, so a slow character
          query cannot hold up the campaigns above it.

          The fallbacks are shaped skeletons rather than a line of text: a
          one-line "Loading campaigns..." standing in for a three-column grid
          made both sections jump down the page when the queries resolved. */}
      <DashboardSection
        as="h1"
        title="Welcome back, Adventurer"
        description="Your campaigns await."
        action={{ href: ROUTES.newCampaign, label: '+ New Campaign' }}
      >
        <Suspense fallback={<CampaignListSkeleton />}>
          <CampaignListServer />
        </Suspense>
      </DashboardSection>

      <DashboardSection
        title="Your Characters"
        description="Manage your adventurers across all genres."
        action={{ href: ROUTES.newCharacter, label: '+ New Character' }}
      >
        <Suspense fallback={<CharacterListSkeleton />}>
          <CharacterListServer />
        </Suspense>
      </DashboardSection>
    </>
  )
}

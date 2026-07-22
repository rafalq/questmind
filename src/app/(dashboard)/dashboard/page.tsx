import ButtonLink from '@/components/ui/button-link'
import { ROUTES } from '@/constants/routes'
import CampaignListServer from '@/features/campaign/components/campaign-list-server'
import CampaignListSkeleton from '@/components/ui/loader/skeleton/campaign-list-skeleton'
import CharacterList from '@/features/character/components/display/character-list-server'
import CharacterListSkeleton from '@/components/ui/loader/skeleton/character-list-skeleton'
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <>
      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Welcome back, Adventurer
            </h1>
            <p className="text-text-secondary mt-1">Your campaigns await.</p>
          </div>
          <div className="shrink-0">
            <ButtonLink href={ROUTES.newCampaign}>+ New Campaign</ButtonLink>
          </div>
        </div>
        {/* The fallback used to be a one-line "Loading campaigns..." standing in
            for a three-column grid, so both sections jumped down the page when
            the queries resolved. The skeleton occupies the space the cards are
            about to take. */}
        <Suspense fallback={<CampaignListSkeleton />}>
          <CampaignListServer />
        </Suspense>
      </section>

      <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              Your Characters
            </h1>
            <p className="text-text-secondary mt-1">
              Manage your adventurers across all genres.
            </p>
          </div>
          <div className="shrink-0">
            <ButtonLink href={ROUTES.newCharacter}>+ New Character</ButtonLink>
          </div>
        </div>
        <Suspense fallback={<CharacterListSkeleton />}>
          <CharacterList />
        </Suspense>
      </section>
    </>
  )
}

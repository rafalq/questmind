import ButtonLink from '@/components/ui/button-link'
import { ROUTES } from '@/constants/routes'
import CampaignListServer from '@/features/campaign/components/campaign-list-server'
import CharacterList from '@/features/character/components/display/character-list'
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <>
      <section className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Welcome back, Adventurer
            </h1>
            <p className="text-text-secondary mt-1">Your campaigns await.</p>
          </div>
          <ButtonLink href={ROUTES.newCampaign}>+ New Campaign</ButtonLink>
        </div>
        <Suspense
          fallback={<div className="text-text-muted">Loading campaigns...</div>}
        >
          <Suspense
            fallback={
              <div className="text-text-muted">Loading campaigns...</div>
            }
          >
            <CampaignListServer />
          </Suspense>
        </Suspense>
      </section>
      <section className="max-w-5xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">
              Your Characters
            </h1>
            <p className="text-text-secondary mt-1">
              Manage your adventurers across all genres.
            </p>
          </div>
          <ButtonLink href={ROUTES.newCharacter}>+ New Character</ButtonLink>
        </div>
        <Suspense
          fallback={
            <div className="text-text-muted">Loading characters...</div>
          }
        >
          <CharacterList />
        </Suspense>
      </section>
    </>
  )
}

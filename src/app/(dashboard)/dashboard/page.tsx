import { getCampaigns } from '@/features/campaign/queries/get-campaigns'
import Link from 'next/link'
import { Suspense } from 'react'

async function CampaignList() {
  const campaigns = await getCampaigns()

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-24 text-text-muted border border-border">
        <p className="text-lg">No campaigns yet.</p>
        <p className="text-sm mt-2">Create your first campaign to begin.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {campaigns.map((campaign) => (
        <div
          key={campaign.id}
          className="p-6 border border-border bg-bg-surface"
        >
          <p className="text-xs text-text-muted uppercase tracking-widest mb-2">
            {campaign.genre}
          </p>
          <h2 className="text-lg font-bold text-text-primary">
            {campaign.name}
          </h2>
          {campaign.description && (
            <p className="text-sm text-text-secondary mt-2 line-clamp-2">
              {campaign.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-8 py-12">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">
            Welcome back, Adventurer
          </h1>
          <p className="text-text-secondary mt-1">Your campaigns await.</p>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="px-5 py-2 border border-accent text-accent hover:bg-accent hover:text-accent-fg transition-all text-sm tracking-wider"
        >
          + New Campaign
        </Link>
      </div>

      <Suspense
        fallback={<div className="text-text-muted">Loading campaigns...</div>}
      >
        <CampaignList />
      </Suspense>
    </div>
  )
}

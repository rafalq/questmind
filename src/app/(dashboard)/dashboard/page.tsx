import { getCampaigns } from '@/features/campaign/queries/get-campaigns'
import Link from 'next/link'
import { Suspense } from 'react'
import { IconSword, IconRocket, IconCpu } from '@tabler/icons-react'
import { ROUTES } from '@/constants/routes'
import CampaignCard from '@/features/campaign/components/campaign-card'

const genreFont = {
  fantasy: 'var(--font-im-fell)',
  'sci-fi': 'var(--font-exo2)',
  cyberpunk: 'var(--font-share-tech-mono)',
}

const genreBg = {
  fantasy: '#1a1208',
  'sci-fi': '#080f1a',
  cyberpunk: '#12081a',
}

const genreIcon = {
  fantasy: <IconSword size={14} />,
  'sci-fi': <IconRocket size={14} />,
  cyberpunk: <IconCpu size={14} />,
}

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
        <CampaignCard key={campaign.id} campaign={campaign} />
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
          href={ROUTES.newCampaign}
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

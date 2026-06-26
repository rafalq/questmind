import GenreCard from '@/components/ui/genre-card'

type Campaign = {
  id: string
  name: string
  genre: 'fantasy' | 'sci-fi' | 'cyberpunk'
  description: string | null
  lastPlayedAt: Date | null
  createdAt: Date
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <GenreCard
      genre={campaign.genre}
      title={campaign.name}
      description={campaign.description ?? undefined}
      meta={
        campaign.lastPlayedAt
          ? `Last played: ${new Date(campaign.lastPlayedAt).toLocaleDateString('en-IE')}`
          : 'Never played'
      }
    />
  )
}

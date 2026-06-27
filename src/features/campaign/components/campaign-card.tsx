'use client'

import GenreCard from '@/components/ui/genre-card'
import { toast } from 'sonner'
import { deleteCampaign } from '../actions/delete-campaign'
import { useAction } from 'next-safe-action/hooks'

type Campaign = {
  id: string
  name: string
  genre: 'fantasy' | 'sci-fi' | 'cyberpunk'
  description: string | null
  lastPlayedAt: Date | null
  createdAt: Date
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  const { execute, isPending } = useAction(deleteCampaign, {
    onSuccess: () => toast.success('Campaign deleted.'),
    onError: () => toast.error('Something went wrong. Please try again.'),
  })

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
      onDelete={{
        label: 'Delete Campaign',
        message: `Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`,
        onConfirm: () => execute({ id: campaign.id }),
        isPending,
      }}
    />
  )
}

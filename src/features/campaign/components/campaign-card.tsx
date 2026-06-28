'use client'

import GenreCard from '@/components/ui/genre-card'
import { toast } from 'sonner'
import { deleteCampaign } from '../actions/delete-campaign'
import { useAction } from 'next-safe-action/hooks'
import PlayButton from '@/features/session/components/play-button'

type Campaign = {
  id: string
  name: string
  genre: 'fantasy' | 'sci-fi' | 'cyberpunk'
  lastPlayedAt: Date | null
  createdAt: Date
}

type Character = {
  id: string
  name: string
  race: string
  characterClass: string
  level: number
}

type Props = {
  campaign: Campaign
  activeSessionId: string | null
  availableCharacters: Character[]
}

export default function CampaignCard({
  campaign,
  activeSessionId,
  availableCharacters,
}: Props) {
  const { execute, isPending } = useAction(deleteCampaign, {
    onSuccess: () => toast.success('Campaign deleted.'),
    onError: () => toast.error('Something went wrong. Please try again.'),
  })

  const actions = (
    <PlayButton
      campaignId={campaign.id}
      activeSessionId={activeSessionId}
      availableCharacters={availableCharacters}
    />
  )

  return (
    <GenreCard
      genre={campaign.genre}
      title={campaign.name}
      meta={
        campaign.lastPlayedAt
          ? `Last played: ${new Date(campaign.lastPlayedAt).toLocaleDateString('en-IE')}`
          : 'Never played'
      }
      actions={actions}
      onDelete={{
        label: 'Delete Campaign',
        message: `Are you sure you want to delete "${campaign.name}"? This action cannot be undone.`,
        onConfirm: () => execute({ id: campaign.id }),
        isPending,
      }}
    />
  )
}

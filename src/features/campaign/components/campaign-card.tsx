'use client'

import GenreCard from '@/components/ui/genre-card'
import WorldLoreModal from '@/features/lore/components/world-lore-modal'
import { WorldLore } from '@/features/lore/queries/get-world-lore'
import PlayButton from '@/features/session/components/play-button'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { deleteCampaign } from '../actions/delete-campaign'

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
  lore: WorldLore | null
}

export default function CampaignCard({
  campaign,
  activeSessionId,
  availableCharacters,
  lore,
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
      subtitle={
        lore ? <WorldLoreModal genre={campaign.genre} lore={lore} /> : undefined
      }
      meta={
        <div className="flex items-center justify-center gap-1 text-accent">
          {campaign.lastPlayedAt ? (
            <>
              <span>Last played: </span>
              <span className="font-medium">
                {new Date(campaign.lastPlayedAt).toLocaleDateString('en-IE')}
              </span>
            </>
          ) : (
            'Never played'
          )}
        </div>
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

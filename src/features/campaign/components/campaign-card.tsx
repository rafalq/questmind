'use client'

import GenreCard from '@/components/ui/genre-card'
import WorldLoreModal from '@/features/lore/components/world-lore-modal'
import { WorldLore } from '@/features/lore/queries/get-world-lore'
import PlayButton from '@/features/session/components/play-button'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { deleteCampaign } from '../actions/delete-campaign'
import CampaignEditableTitle from './campaign-editable-title'
import { genreCardImage } from '@/lib/genre-card-image'
import { Genre } from '@/worlds/schema/primitives'

type Campaign = {
  id: string
  name: string
  genre: Genre
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
      imageUrl={genreCardImage(campaign.genre)}
      title={
        <CampaignEditableTitle campaignId={campaign.id} name={campaign.name} />
      }
      subtitle={
        lore ? <WorldLoreModal genre={campaign.genre} lore={lore} /> : undefined
      }
      meta={
        // whitespace-nowrap on the row and a non-breaking space before the
        // date: "Last played:" and the date belong on one line, and the meta
        // slot is the narrowest thing in the header. justify-center was doing
        // nothing useful here — the slot is sized by its content.
        <div className="flex items-center gap-1 whitespace-nowrap text-accent">
          {campaign.lastPlayedAt ? (
            <>
              {/* The label is the first thing worth dropping on a narrow
                  card; the date alone still reads. */}
              <span className="hidden sm:inline">Last played:</span>
              <span className="font-medium">
                {new Date(campaign.lastPlayedAt).toLocaleDateString('en-IE')}
              </span>
            </>
          ) : (
            <span>Never played</span>
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

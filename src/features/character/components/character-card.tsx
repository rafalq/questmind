'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAction } from 'next-safe-action/hooks'
import GenreCard from '@/components/ui/genre-card'
import CharacterDetailModal, {
  type CharacterDetail,
} from './character-detail-modal'
import { deleteCharacter } from '../actions/delete-character'
import { ROUTES } from '@/constants/routes'
import { IconPlayerPlay } from '@tabler/icons-react'

type Props = {
  character: CharacterDetail
}

export default function CharacterCard({ character }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const router = useRouter()

  const { execute, isPending } = useAction(deleteCharacter, {
    onSuccess: () => toast.success('Character deleted.'),
    onError: () => toast.error('Something went wrong. Please try again.'),
  })

  const badge = (
    <span
      className={`text-xs px-2 py-0.5 border ${
        character.isAlive
          ? 'border-accent text-accent'
          : 'border-red-700 text-red-700'
      }`}
    >
      {character.isAlive ? 'Alive' : 'Dead'}
    </span>
  )

  const footer = (
    <div className="flex items-center justify-between">
      <p className="text-text-muted text-xs">
        Level {character.level} · {character.characterXp} XP
      </p>

      {character.activeCampaign && (
        <button
          className="text-xs text-accent hover:underline underline-offset-2 transition-colors flex items-center justify-center gap-1"
          onClick={(e) => {
            e.stopPropagation()
            const { campaignId, sessionId } = character.activeCampaign!
            router.push(ROUTES.play(campaignId!, sessionId))
          }}
        >
          Resume &quot;{character.activeCampaign.campaignName}&quot;{' '}
          <IconPlayerPlay stroke={2} size={12} />
        </button>
      )}
    </div>
  )

  return (
    <>
      <GenreCard
        genre={character.genre}
        title={character.name}
        subtitle={`${character.race} · ${character.characterClass.replace(/_/g, ' ')}`}
        badge={badge}
        footer={footer}
        onClick={() => setModalOpen(true)}
        onDelete={{
          label: 'Delete Character',
          message: `Are you sure you want to delete "${character.name}"? This action cannot be undone.`,
          onConfirm: () => execute({ id: character.id }),
          isPending,
        }}
      />

      {modalOpen && (
        <CharacterDetailModal
          character={character}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  )
}

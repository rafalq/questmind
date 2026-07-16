'use client'

import ButtonPlayResume from '@/components/ui/button-play-resume'
import GenreCard from '@/components/ui/genre-card'
import { ROUTES } from '@/constants/routes'
import { IconPlayerPlay, IconSkull } from '@tabler/icons-react'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useState, type MouseEvent } from 'react'
import { toast } from 'sonner'
import { deleteCharacter } from '@/features/character/actions/delete-character'
import { levelFromXp } from '@/features/character/constants/progression'
import { getClassLabel, getRaceLabel, getWorld } from '@/worlds'
import CharacterDetailModal, {
  type CharacterDetail,
} from './character-detail-modal'
import Tooltip from '@/components/ui/tooltip'
import { TREIGTHE_CLASS_ICONS } from '@/features/character/constants/fantasy/treigthe'
import { IconUser } from '@tabler/icons-react'

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
    <div
      className={`flex justify-center items-center gap-1.5 text-[0.625rem] px-2 py-0.5 ${
        character.isAlive ? 'text-accent' : 'text-red-700'
      }`}
    >
      <div className="flex items-center gap-1">
        {character.isAlive ? (
          character.activeCampaign && (
            <div className="flex items-center justify-start gap-1">
              <Tooltip content="Active campaign" position="top">
                {character.activeCampaign?.campaignName}
              </Tooltip>
            </div>
          )
        ) : (
          <IconSkull stroke={2} size={12} color="red" />
        )}
      </div>
    </div>
  )

  const level = levelFromXp(character.characterXp)

  const footer = (
    <div className="flex items-center justify-between">
      <p className="text-text-muted text-xs">
        Level {level} · {character.characterXp} XP
      </p>
      {character.activeCampaign && (
        <ButtonPlayResume
          onClick={(e?: MouseEvent<HTMLButtonElement>) => {
            e?.stopPropagation()
            const { campaignId, sessionId } = character.activeCampaign!
            router.push(ROUTES.play(campaignId!, sessionId))
          }}
          isActiveSession={!!character.activeCampaign}
        >
          &quot;{character.activeCampaign.campaignName}&quot;{' '}
          <IconPlayerPlay stroke={2} size={12} />
        </ButtonPlayResume>
      )}
    </div>
  )

  const ClassIcon =
    TREIGTHE_CLASS_ICONS[
      character.characterClass as keyof typeof TREIGTHE_CLASS_ICONS
    ] ?? IconUser

  const avatar = (
    <div className="shrink-0 w-10 h-10 rounded-full border border-border flex items-center justify-center text-accent bg-bg-base/40">
      <ClassIcon size={18} />
    </div>
  )

  return (
    <>
      <GenreCard
        genre={character.genre}
        title={character.name}
        subtitle={`${getRaceLabel(character.world, character.race)} · ${getClassLabel(character.world, character.characterClass)}`}
        badge={badge}
        avatar={avatar}
        imageUrl={getWorld(character.world).cardImageUrl}
        footer={footer}
        onClick={() => setModalOpen(true)}
        onDelete={{
          label: 'Delete Character',
          message: `Are you sure you want to delete "${character.name}"? This action cannot be undone.`,
          onConfirm: () => execute({ id: character.id }),
          isPending,
        }}
        className="cursor-pointer"
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

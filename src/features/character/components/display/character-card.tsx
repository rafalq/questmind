'use client'

import type { CharacterDetail } from '@/features/character/types/character-detail'
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
import CharacterDetailModal from './character-detail-modal'
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
    // The card is a dark media surface in both themes, so a dark red would
    // disappear here — red-400 reads on the overlay the way red-700 does not.
    // The wrapper div that only held one flex child has gone: it added a
    // nesting level and no layout.
    <div
      className={`flex items-center gap-1.5 truncate text-[0.625rem] ${
        character.isAlive ? 'text-accent' : 'text-red-400'
      }`}
    >
      {character.isAlive ? (
        character.activeCampaign && (
          <Tooltip content="Active campaign" position="top">
            {character.activeCampaign.campaignName}
          </Tooltip>
        )
      ) : (
        <IconSkull stroke={2} size={12} aria-label="Dead" />
      )}
    </div>
  )

  const level = levelFromXp(character.characterXp)

  const footer = (
    // Wraps instead of overflowing: the resume button carries a campaign name
    // of unknown length, and at 360px it will not sit beside the level line.
    <div className="flex flex-wrap items-center justify-between gap-2">
      <p className="whitespace-nowrap text-xs text-text-muted">
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
          <span className="max-w-[12ch] truncate">
            &quot;{character.activeCampaign.campaignName}&quot;
          </span>
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
    // bg-bg-base/40 resolved to a translucent cream in the light theme — the
    // pale disc visible over the artwork. The backing has to be dark in both
    // themes, like everything else on this surface, so it is stated literally
    // rather than taken from a theme token.
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border bg-black/40 text-accent">
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

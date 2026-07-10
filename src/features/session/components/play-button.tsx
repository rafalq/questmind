'use client'

import ButtonPlayResume from '@/components/ui/button-play-resume'
import CharacterSelectModal, {
  type SelectableCharacter,
} from './character-select-modal'
import { ROUTES } from '@/constants/routes'
import { createSession } from '@/features/session/actions/create-session'
import { useAction } from 'next-safe-action/hooks'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type Props = {
  campaignId: string
  activeSessionId: string | null
  availableCharacters: SelectableCharacter[]
}

export default function PlayButton({
  campaignId,
  activeSessionId,
  availableCharacters,
}: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)

  const { execute, isPending } = useAction(createSession, {
    onSuccess: ({ data }) => {
      if (!data?.sessionId) return
      toast.success('Session started!')
      router.push(ROUTES.play(campaignId, data.sessionId))
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? 'Something went wrong.')
    },
  })

  const handlePlay = () => {
    if (activeSessionId) {
      router.push(ROUTES.play(campaignId, activeSessionId))
      return
    }
    setShowModal(true)
  }

  return (
    <>
      <div className="flex justify-end-safe">
        <ButtonPlayResume
          onClick={handlePlay}
          isActiveSession={!!activeSessionId}
        />
      </div>

      {showModal && (
        <CharacterSelectModal
          characters={availableCharacters}
          isPending={isPending}
          onConfirm={(characterId) => execute({ campaignId, characterId })}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  )
}

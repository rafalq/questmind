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
      // Closed before the push, not after. The modal is the last thing the
      // player sees while the route loads, and leaving it up with a disabled
      // "Starting…" button reads as a hang — the session screen's loading
      // skeleton is the better place for that feedback, and it cannot show
      // while a modal is covering it.
      setShowModal(false)
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

  // Resume is a known URL before the click, so the route can be fetched while
  // the pointer is still over the button. New sessions cannot do this: their
  // sessionId does not exist until the action has run.
  const prefetchResume = () => {
    if (activeSessionId)
      router.prefetch(ROUTES.play(campaignId, activeSessionId))
  }

  return (
    <>
      <div className="flex justify-end-safe">
        <ButtonPlayResume
          onClick={handlePlay}
          onMouseEnter={prefetchResume}
          onFocus={prefetchResume}
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

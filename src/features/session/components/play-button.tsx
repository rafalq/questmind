'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAction } from 'next-safe-action/hooks'
import { toast } from 'sonner'
import { createSession } from '@/features/session/actions/create-session'
import { ROUTES } from '@/constants/routes'
import Button from '@/components/ui/button'

type Character = {
  id: string
  name: string
  race: string
  characterClass: string
  level: number
}

type Props = {
  campaignId: string
  activeSessionId: string | null
  availableCharacters: Character[]
}

export default function PlayButton({
  campaignId,
  activeSessionId,
  availableCharacters,
}: Props) {
  const router = useRouter()
  const [showModal, setShowModal] = useState(false)
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(
    null
  )

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

  // If there's already an active session, go straight to it
  const handlePlay = () => {
    if (activeSessionId) {
      router.push(ROUTES.play(campaignId, activeSessionId))
      return
    }
    setShowModal(true)
  }

  const handleConfirm = () => {
    if (!selectedCharacterId) return
    execute({ campaignId, characterId: selectedCharacterId })
  }

  return (
    <>
      <Button size="sm" onClick={handlePlay}>
        {activeSessionId ? 'Resume' : 'Play'}
      </Button>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-bg-primary border border-border p-6 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold text-text-primary mb-1">
              Choose your character
            </h2>
            <p className="text-sm text-text-muted mb-6">
              {"Only characters matching this campaign's genre are shown."}
            </p>

            {availableCharacters.length === 0 ? (
              <p className="text-sm text-text-muted text-center py-8">
                No available characters for this genre. Create one first.
              </p>
            ) : (
              <ul className="space-y-2 mb-6">
                {availableCharacters.map((c) => (
                  <li
                    key={c.id}
                    onClick={() => setSelectedCharacterId(c.id)}
                    className={`px-4 py-3 border cursor-pointer transition-colors ${
                      selectedCharacterId === c.id
                        ? 'border-accent text-text-primary'
                        : 'border-border text-text-secondary hover:border-accent/50'
                    }`}
                  >
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-xs text-text-muted">
                      Level {c.level} · {c.race} ·{' '}
                      {c.characterClass.replace('_', ' ')}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button
                disabled={
                  !selectedCharacterId || availableCharacters.length === 0
                }
                loading={isPending}
                loadingText="Starting..."
                onClick={handleConfirm}
              >
                Start Adventure
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

'use client'

import { useState } from 'react'
import {
  type messagesTable,
  type campaignsTable,
  type charactersTable,
} from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'
import ChatPanel from './chat-panel'
import StatsPanel from './stats-panel'
import { SNAPSHOT_DELIMITER } from '@/features/session/lib/stream-protocol'

type DbMessage = typeof messagesTable.$inferSelect
type Campaign = typeof campaignsTable.$inferSelect
type Character = typeof charactersTable.$inferSelect

type UIMessage = {
  role: 'user' | 'assistant'
  content: string
}

type Props = {
  sessionId: string
  campaignId: string
  initialMessages: DbMessage[]
  campaign: Campaign
  character: Character
}

export default function GameScreen({
  sessionId,
  initialMessages,
  campaign,
  character,
}: Props) {
  // Convert DB messages to UI messages
  const [messages, setMessages] = useState<UIMessage[]>(
    initialMessages
      // Drop the technical initial-snapshot message (assistant, empty content).
      // It carries the starting HP snapshot (read separately into lastSnapshot
      // below) but must not render as an empty chat bubble.
      .filter((m) => !(m.role === 'assistant' && m.content === ''))
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
  )

  // Use the last snapshot from history as initial state
  const lastSnapshot = [...initialMessages].reverse().find((m) => m.snapshot)
    ?.snapshot as GameSnapshot | null

  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(lastSnapshot)
  const [isStreaming, setIsStreaming] = useState(false)

  const sendMessage = async (message: string) => {
    if (isStreaming) return

    // Optimistically add the player's message
    setMessages((prev) => [...prev, { role: 'user', content: message }])
    setIsStreaming(true)

    try {
      const res = await fetch('/api/game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message }),
      })

      if (!res.ok || !res.body) throw new Error('Stream failed')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let raw = ''

      // Add empty assistant message to stream into
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        raw += decoder.decode(value, { stream: true })

        // The server appends the game-state snapshot after SNAPSHOT_DELIMITER.
        // Never render past it — narrative only, up to the delimiter.
        const delimIdx = raw.indexOf(SNAPSHOT_DELIMITER)
        const narrative = delimIdx === -1 ? raw : raw.slice(0, delimIdx)

        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: narrative,
          }
          return updated
        })
      }

      // Apply the game-state snapshot straight away — no refetch, no cache.
      // Panel reflects the delta in the same second as the narrative (FR-005).
      const delimIdx = raw.indexOf(SNAPSHOT_DELIMITER)
      if (delimIdx !== -1) {
        const jsonStr = raw.slice(delimIdx + SNAPSHOT_DELIMITER.length).trim()
        try {
          setSnapshot(JSON.parse(jsonStr) as GameSnapshot)
        } catch {
          console.error('Failed to parse streamed snapshot')
        }
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Something went wrong. Please try again.',
        },
      ])
    } finally {
      setIsStreaming(false)
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-bg-base">
      {/* Left: chat */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">
            {campaign.name}
          </h2>
          <p className="text-sm text-text-muted">
            {character.name} ·{' '}
            <span className="capitalize">
              {character.characterClass.replaceAll('_', ' ')}
            </span>
          </p>
        </div>
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          onSend={sendMessage}
          genre={campaign.genre}
          characterName={character.name}
        />
      </div>

      {/* Right: stats */}
      <aside className="w-72 border-l border-border overflow-y-auto shrink-0 bg-bg-surface">
        <StatsPanel snapshot={snapshot} character={character} />
      </aside>
    </div>
  )
}

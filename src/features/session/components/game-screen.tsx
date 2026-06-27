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
    initialMessages.map((m) => ({
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
      let assistantText = ''

      // Add empty assistant message to stream into
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        assistantText += decoder.decode(value, { stream: true })

        // Update the last assistant message in place
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: assistantText,
          }
          return updated
        })
      }

      // Fetch the latest snapshot from the last saved message
      const snapshotRes = await fetch(
        `/api/game/snapshot?sessionId=${sessionId}`
      )
      if (snapshotRes.ok) {
        const { snapshot: newSnapshot } = await snapshotRes.json()
        if (newSnapshot) setSnapshot(newSnapshot)
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
    <div className="flex h-screen overflow-hidden">
      {/* Left: chat */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">
            {campaign.name}
          </h2>
          <p className="text-sm text-text-muted">
            {character.name} · {character.characterClass.replace('_', ' ')}
          </p>
        </div>
        <ChatPanel
          messages={messages}
          isStreaming={isStreaming}
          onSend={sendMessage}
        />
      </div>

      {/* Right: stats */}
      <aside className="w-72 border-l border-border overflow-y-auto shrink-0">
        <StatsPanel snapshot={snapshot} character={character} />
      </aside>
    </div>
  )
}

'use client'

import { useRef, useState } from 'react'
import {
  type messagesTable,
  type campaignsTable,
  type charactersTable,
} from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'
import ChatPanel, { type ChatPanelHandle } from './chat-panel'
import StatsPanel from './stats-panel'
import { SNAPSHOT_DELIMITER } from '@/features/session/lib/stream-protocol'
import { UIMessage } from '../lib/types'
import {
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react'
import type { Attribute } from '@/worlds/schema'

type DbMessage = typeof messagesTable.$inferSelect
type Campaign = typeof campaignsTable.$inferSelect
type Character = typeof charactersTable.$inferSelect

type Props = {
  sessionId: string
  campaignId: string
  initialMessages: DbMessage[]
  campaign: Campaign
  character: Character
  // Base values from the DB: point-buy plus race/class/gender modifiers.
  // Per-level growth is applied on read, in the panel.
  baseAttributes: Record<Attribute, number>
}

export default function GameScreen({
  sessionId,
  initialMessages,
  campaign,
  character,
  baseAttributes,
}: Props) {
  // Reading mode: hides the stats panel so prose gets the full width.
  // Also the mobile default — the panel doesn't fit beside the chat at 360px.
  const [isPanelOpen, setIsPanelOpen] = useState(true)
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
        snapshot: m.snapshot as GameSnapshot | null,
      }))
  )

  // Clicking an ability seeds the composer. Imperative, not state: this is an
  // event, and lifting the input's state would re-render the chat on every
  // keystroke from up here.
  const chatRef = useRef<ChatPanelHandle>(null)

  const handleUseAbility = (name: string) => {
    chatRef.current?.insertAbility(name)
  }

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
          const parsed = JSON.parse(jsonStr) as GameSnapshot
          setSnapshot(parsed)
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              snapshot: parsed,
            }
            return updated
          })
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
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">
            {campaign.name}
          </h2>
          <button
            type="button"
            onClick={() => setIsPanelOpen((v) => !v)}
            className="shrink-0 p-1.5 text-text-muted hover:text-accent transition-colors"
            aria-label={isPanelOpen ? 'Hide stats panel' : 'Show stats panel'}
            aria-expanded={isPanelOpen}
          >
            {isPanelOpen ? (
              <IconLayoutSidebarRightCollapse size={20} />
            ) : (
              <IconLayoutSidebarRightExpand size={20} />
            )}
          </button>
        </div>
        <ChatPanel
          ref={chatRef}
          messages={messages}
          isStreaming={isStreaming}
          onSend={sendMessage}
          genre={campaign.genre}
          characterName={character.name}
        />
      </div>

      {/* Right: stats */}
      <aside
        className={`border-l border-border overflow-y-auto shrink-0 bg-bg-surface transition-[width] duration-300 ${
          isPanelOpen ? 'w-72' : 'w-0 border-l-0 overflow-hidden'
        }`}
      >
        <StatsPanel
          snapshot={snapshot}
          character={character}
          baseAttributes={baseAttributes}
          onUseAbility={handleUseAbility}
        />
      </aside>
    </div>
  )
}

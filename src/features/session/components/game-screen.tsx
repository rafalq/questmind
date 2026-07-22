'use client'

import { useEffect, useRef, useState } from 'react'
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
  IconArrowLeft,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react'
import type { Attribute } from '@/worlds/schema'
import { ROUTES } from '@/constants/routes'
import Link from 'next/link'

type DbMessage = typeof messagesTable.$inferSelect
type Campaign = typeof campaignsTable.$inferSelect
type Character = typeof charactersTable.$inferSelect

const DESKTOP = '(min-width: 1024px)'

type Props = {
  sessionId: string
  campaignId: string
  initialMessages: DbMessage[]
  campaign: Campaign
  character: Character
  // Base values from the DB: point-buy plus race/class/gender modifiers.
  // Per-level growth is applied on read, in the panel.
  baseAttributes: Record<Attribute, number>
  // True when the session has no narrative assistant message yet. The page
  // used to generate the opening before rendering, which meant the browser sat
  // on the previous screen for the whole model call; the opening is now
  // fetched from here and streamed in, like every other turn.
  needsOpening: boolean
}

export default function GameScreen({
  sessionId,
  initialMessages,
  campaign,
  character,
  baseAttributes,
  needsOpening,
}: Props) {
  // Reading mode: hides the stats panel so prose gets the full width.
  //
  // null = the player has not chosen yet, so the default is left to CSS:
  // closed below lg (where the panel is an overlay drawer), open at lg and up
  // (where it is a column beside the chat). Deriving that default from
  // matchMedia in an effect would mean rendering the wrong state first and
  // correcting it after paint — a visible flash, and a cascading render React
  // now warns about. Once the toggle is clicked the value becomes a boolean
  // and takes over from the breakpoint for the rest of the session.
  const [isPanelOpen, setIsPanelOpen] = useState<boolean | null>(null)

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

  // Reading the viewport inside an event handler is fine — it happens after
  // mount, in response to a user action, not during render.
  const isDesktop = () => window.matchMedia(DESKTOP).matches

  const togglePanel = () => {
    setIsPanelOpen((prev) => !(prev ?? isDesktop()))
  }

  const handleUseAbility = (name: string) => {
    chatRef.current?.insertAbility(name)
    // On mobile the panel is an overlay sitting on top of the composer, so it
    // has to get out of the way once it has done its job.
    if (!isDesktop()) setIsPanelOpen(false)
  }

  // Use the last snapshot from history as initial state
  const lastSnapshot = [...initialMessages].reverse().find((m) => m.snapshot)
    ?.snapshot as GameSnapshot | null

  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(lastSnapshot)
  const [isStreaming, setIsStreaming] = useState(false)

  // Reads a plain-text stream into the last assistant message, one chunk at a
  // time. `onChunk` returns the prose that should be visible for the text
  // received so far, which is where the two callers differ: a turn has to stop
  // rendering at the snapshot delimiter, an opening is prose to the last
  // character. Returns everything that was read.
  const consumeStream = async (
    res: Response,
    onChunk: (raw: string) => string
  ): Promise<string> => {
    const reader = res.body!.getReader()
    const decoder = new TextDecoder()
    let raw = ''

    // Empty assistant message to stream into.
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    for (;;) {
      const { done, value } = await reader.read()
      if (done) break

      raw += decoder.decode(value, { stream: true })
      const visible = onChunk(raw)

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: visible,
        }
        return updated
      })
    }

    return raw
  }

  // The opening is requested exactly once per mount. Without the ref, React's
  // development StrictMode double-invokes the effect and two openings race;
  // the server refuses the second, but the client would still have opened two
  // empty bubbles.
  const openingRequested = useRef(false)

  useEffect(() => {
    if (!needsOpening || openingRequested.current) return
    openingRequested.current = true

    let cancelled = false

    const run = async () => {
      setIsStreaming(true)
      try {
        const res = await fetch('/api/game/opening', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        // 204: the opening already exists — a refresh landed here, or a
        // previous request finished writing it. Nothing to render.
        if (res.status === 204) return
        if (!res.ok || !res.body) throw new Error('Opening stream failed')

        // The opening carries no state block; the starting snapshot was
        // written at session creation, so everything received is prose.
        await consumeStream(res, (raw) => raw)
      } catch {
        if (!cancelled) {
          setMessages((prev) => [
            ...prev,
            {
              role: 'assistant',
              content:
                'The Game Master is gathering their thoughts. Refresh to begin.',
            },
          ])
        }
      } finally {
        if (!cancelled) setIsStreaming(false)
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [needsOpening, sessionId])

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

      // The server appends the game-state snapshot after SNAPSHOT_DELIMITER.
      // Never render past it — narrative only, up to the delimiter.
      const raw = await consumeStream(res, (text) => {
        const delimIdx = text.indexOf(SNAPSHOT_DELIMITER)
        return delimIdx === -1 ? text : text.slice(0, delimIdx)
      })

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

  // Panel geometry. The null case carries both breakpoints in one class list;
  // the boolean cases pin the panel regardless of viewport width.
  const panelClass =
    isPanelOpen === null
      ? 'translate-x-full lg:w-72 lg:translate-x-0'
      : isPanelOpen
        ? 'translate-x-0 lg:w-72'
        : 'translate-x-full lg:w-0 lg:overflow-hidden lg:border-l-0'

  return (
    // min-h-0 + flex-1 rather than h-screen: this sits inside the root
    // layout's <main class="flex flex-1 flex-col">, so h-screen would stack a
    // full viewport under the navbar and push the composer off-screen. It
    // also avoids the mobile-Safari address-bar problem that plagues 100vh.
    <div className="relative flex min-h-0 flex-1 overflow-hidden bg-bg-base">
      {/* Left: chat */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <Link
            href={ROUTES.dashboard}
            className="shrink-0 text-text-muted transition-colors hover:text-accent"
            aria-label="Back to dashboard"
          >
            <IconArrowLeft size={20} />
          </Link>
          <h2 className="truncate text-base font-bold text-text-primary sm:text-lg">
            {campaign.name}
          </h2>
          <button
            type="button"
            onClick={togglePanel}
            className="shrink-0 p-1.5 text-text-muted transition-colors hover:text-accent"
            aria-label="Toggle stats panel"
            aria-expanded={isPanelOpen ?? undefined}
          >
            {isPanelOpen === null ? (
              // Undecided: the icon has to agree with what CSS is showing, so
              // it switches at the same breakpoint the panel does.
              <>
                <IconLayoutSidebarRightExpand
                  size={20}
                  className="lg:hidden"
                  aria-hidden
                />
                <IconLayoutSidebarRightCollapse
                  size={20}
                  className="hidden lg:block"
                  aria-hidden
                />
              </>
            ) : isPanelOpen ? (
              <IconLayoutSidebarRightCollapse size={20} aria-hidden />
            ) : (
              <IconLayoutSidebarRightExpand size={20} aria-hidden />
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

      {/* Backdrop — drawer mode only, and only once the player has opened the
          panel by hand. Tapping outside closes it, the gesture an overlay
          implies. lg:hidden because above that the panel is a column, not an
          overlay, and dimming the chat behind it would make no sense. */}
      {isPanelOpen === true && (
        <div
          className="absolute inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setIsPanelOpen(false)}
          aria-hidden
        />
      )}

      {/* Right: stats. Overlay drawer below lg, in-flow column at lg and up.
          Width is animated only on desktop; the drawer slides instead, so the
          content never reflows mid-transition. */}
      <aside
        className={`absolute inset-y-0 right-0 z-40 w-[85vw] max-w-xs overflow-y-auto border-l border-border bg-bg-surface transition-transform duration-300 lg:static lg:z-auto lg:max-w-none lg:shrink-0 lg:translate-x-0 lg:transition-[width] ${panelClass}`}
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

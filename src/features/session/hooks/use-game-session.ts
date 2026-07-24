'use client'

import { type messagesTable } from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'
import { SNAPSHOT_DELIMITER } from '@/features/session/lib/stream-protocol'
import { useCallback, useEffect, useRef, useState } from 'react'
import { type UIMessage } from '../lib/types'

type DbMessage = typeof messagesTable.$inferSelect

type Params = {
  sessionId: string
  initialMessages: DbMessage[]
  /**
   * True when the session has no narrative assistant message yet. The page
   * used to generate the opening before rendering, which left the browser on
   * the previous screen for the whole model call; it is fetched from here and
   * streamed in instead, like every other turn.
   */
  needsOpening: boolean
}

/**
 * The client half of the turn loop: what is on screen, what the server has
 * said so far, and whether the Game Master is mid-sentence.
 *
 * Separated from GameScreen because the two are unrelated concerns that were
 * sharing a file - this is a wire protocol with a retry story and a
 * StrictMode story, and GameScreen is a two-column layout with a drawer.
 */
export function useGameSession({
  sessionId,
  initialMessages,
  needsOpening,
}: Params) {
  const [messages, setMessages] = useState<UIMessage[]>(() =>
    initialMessages
      // Drop the technical initial-snapshot message (assistant, empty
      // content). It carries the starting HP snapshot, read separately into
      // lastSnapshot below, but must not render as an empty chat bubble.
      .filter((m) => !(m.role === 'assistant' && m.content === ''))
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
        snapshot: m.snapshot as GameSnapshot | null,
      }))
  )

  const [snapshot, setSnapshot] = useState<GameSnapshot | null>(
    () =>
      ([...initialMessages].reverse().find((m) => m.snapshot)?.snapshot ??
        null) as GameSnapshot | null
  )

  // Seeded from needsOpening, not false. The opening request is fired in an
  // effect, so with a false initial value the first paint showed an empty chat
  // carrying the "Your adventure begins" placeholder, and the typing indicator
  // only appeared once the effect had run - roughly two seconds of looking
  // like nothing was happening.
  const [isStreaming, setIsStreaming] = useState(needsOpening)

  /**
   * Reads a plain-text stream into the last assistant message, one chunk at a
   * time. `onChunk` returns the prose that should be visible for the text
   * received so far, which is where the two callers differ: a turn has to stop
   * rendering at the snapshot delimiter, an opening is prose to the last
   * character. Returns everything that was read.
   */
  const consumeStream = useCallback(
    async (
      res: Response,
      onChunk: (raw: string) => string,
      // The opening seeds its own bubble before the request goes out, so the
      // typing indicator is on screen during the wait rather than after it. A
      // turn has no such wait to cover and opens its bubble here.
      { appendBubble = true }: { appendBubble?: boolean } = {}
    ): Promise<string> => {
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let raw = ''

      if (appendBubble) {
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }])
      }

      for (;;) {
        const { done, value } = await reader.read()
        if (done) break

        raw += decoder.decode(value, { stream: true })
        const visible = onChunk(raw)

        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'assistant', content: visible }
          return updated
        })
      }

      return raw
    },
    []
  )

  // The opening is requested exactly once per mount. Without the ref, React's
  // development StrictMode double-invokes the effect and two openings race;
  // the server refuses the second, but the client would still have opened two
  // empty bubbles.
  const openingRequested = useRef(false)

  useEffect(() => {
    if (!needsOpening || openingRequested.current) return
    openingRequested.current = true

    // The empty bubble goes up before the request, not after it. fetch does
    // not resolve until the server has sent headers, and the opening route
    // runs auth, the session query and the lore retrieval first - several
    // seconds during which messages was still empty, so ChatPanel showed its
    // "Your adventure begins. What do you do?" placeholder. The player was
    // being invited to act while the Game Master was mid-sentence.
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

    // Drops the seeded bubble again when there turns out to be nothing to
    // stream into it. Trailing and empty is the only shape it can have at that
    // point - a bubble with content has already received text and must stay.
    const dropSeededBubble = () =>
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        return last?.role === 'assistant' && last.content === ''
          ? prev.slice(0, -1)
          : prev
      })

    const run = async () => {
      try {
        const res = await fetch('/api/game/opening', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId }),
        })

        // 204: the opening already exists - a refresh landed here, or a
        // previous request finished writing it. Nothing to render.
        if (res.status === 204) {
          dropSeededBubble()
          return
        }
        if (!res.ok || !res.body) throw new Error('Opening stream failed')

        // The opening carries no state block; the starting snapshot was
        // written at session creation, so everything received is prose.
        await consumeStream(res, (raw) => raw, { appendBubble: false })
      } catch {
        dropSeededBubble()
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content:
              'The Game Master is gathering their thoughts. Refresh to begin.',
          },
        ])
      } finally {
        // Unconditional. This used to be guarded by a `cancelled` flag raised
        // in the effect cleanup, which read as ordinary teardown hygiene and
        // was in fact a stall: under StrictMode the effect mounts, tears down
        // and remounts, so cleanup raised the flag while the original request
        // was still streaming, and isStreaming was never cleared.
        //
        // There was nothing to guard against: the ref above allows one request
        // per mount, and setState on an unmounted component has been a no-op
        // since React 18.
        setIsStreaming(false)
      }
    }

    void run()
  }, [needsOpening, sessionId, consumeStream])

  /**
   * Applies the game-state snapshot straight away - no refetch, no cache - so
   * the panel reflects the delta in the same second as the narrative (FR-005).
   *
   * A snapshot that fails to parse costs the panel update, not the turn: the
   * prose the player just read stays on screen either way.
   */
  const applySnapshot = useCallback((raw: string) => {
    const delimIdx = raw.indexOf(SNAPSHOT_DELIMITER)
    if (delimIdx === -1) return

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
  }, [])

  const sendMessage = useCallback(
    async (message: string) => {
      if (isStreaming) return

      // Optimistically add the player's message.
      setMessages((prev) => [...prev, { role: 'user', content: message }])
      setIsStreaming(true)

      try {
        const res = await fetch('/api/game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, message }),
        })

        if (!res.ok || !res.body) throw new Error('Stream failed')

        // The server appends the snapshot after SNAPSHOT_DELIMITER. Never
        // render past it - narrative only, up to the delimiter.
        const raw = await consumeStream(res, (text) => {
          const delimIdx = text.indexOf(SNAPSHOT_DELIMITER)
          return delimIdx === -1 ? text : text.slice(0, delimIdx)
        })

        applySnapshot(raw)
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
    },
    [isStreaming, sessionId, consumeStream, applySnapshot]
  )

  return { messages, snapshot, isStreaming, sendMessage }
}

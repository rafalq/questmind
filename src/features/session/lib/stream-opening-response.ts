import { SEPARATOR } from '@/features/session/lib/build-system-prompt/'
import { AI_MODEL, MAX_TOKENS } from '@/lib/ai/config'
import { anthropic } from '@/lib/ai/client'
import { persistOpening, stripStateBlock } from './generate-opening'
import { streamUntilSeparator } from './separator-stream'

// Serverless instances do not share this, so it is not a distributed lock -
// the database check in the route is what actually prevents a duplicate
// opening. This only stops the cheap, common case: React's development
// StrictMode mounting the effect twice and firing two requests within the same
// millisecond, before either has written anything for the other to find.
const inFlight = new Set<string>()

export function isOpeningInFlight(sessionId: string): boolean {
  return inFlight.has(sessionId)
}

type Params = {
  sessionId: string
  system: string
  task: string
}

/**
 * Streams the opening narration to the client and persists it.
 *
 * The counterpart of streamGameResponse for the first turn. Two things make it
 * different from an ordinary turn: the state block the model emits after the
 * separator is withheld from the player rather than shown, and the text that
 * gets saved is what the model produced, not what the client received.
 */
export function streamOpeningResponse({
  sessionId,
  system,
  task,
}: Params): Response {
  const encoder = new TextEncoder()

  inFlight.add(sessionId)

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      let full = ''

      try {
        const events = anthropic.messages.stream({
          model: AI_MODEL,
          // 700, not 400 - the prompt caps prose at ~200 words, but
          // token-heavy languages (e.g. Polish) overrun a 400-token ceiling
          // and get cut mid-sentence before the opening finishes.
          max_tokens: MAX_TOKENS.opening,
          system,
          messages: [{ role: 'user', content: task }],
        })

        const result = await streamUntilSeparator({
          events,
          separator: SEPARATOR,
          emit: (text) => controller.enqueue(encoder.encode(text)),
        })
        full = result.full

        controller.close()
      } catch (error) {
        console.error(`Opening stream failed for session ${sessionId}:`, error)
        controller.error(error)
      } finally {
        // Persisted from the accumulated text, not from what the client
        // received. If the player closed the tab halfway through, the opening
        // they never saw is still the one waiting when they resume.
        try {
          await persistOpening(sessionId, stripStateBlock(full, sessionId))
        } catch (error) {
          console.error(`Failed to save opening for ${sessionId}:`, error)
        }
        inFlight.delete(sessionId)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      // Proxies that buffer a response defeat the point of streaming it.
      'X-Accel-Buffering': 'no',
    },
  })
}

import { auth } from '@clerk/nextjs/server'
import { validateSession } from '@/features/session/lib/validate-session'
import { buildClaudeMessages } from '@/features/session/lib/build-claude-messages'
import { streamGameResponse } from '@/features/session/lib/stream-game-response'
import {
  isDebugEnabled,
  isDebugCommand,
  applyDebugCommand,
} from '@/features/session/lib/debug-commands'
import { SNAPSHOT_DELIMITER } from '@/features/session/lib/stream-protocol'
import { db } from '@/db'
import { messagesTable } from '@/db/schema'

export const runtime = 'edge'

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { sessionId, message } = await req.json()
  if (!sessionId || !message)
    return new Response('Bad request', { status: 400 })

  const context = await validateSession(sessionId, userId)
  if (!context)
    return new Response('Session not found or inactive', { status: 404 })

  // ── DEV-ONLY debug command interception ──────────────────────────────
  // Hard-gated: no-op in production regardless of input.
  if (isDebugEnabled() && isDebugCommand(message)) {
    const result = applyDebugCommand(message, context.lastSnapshot)
    if (result) {
      // Persist the forced snapshot exactly like a real assistant turn,
      // so resume/history stay consistent.
      await db.insert(messagesTable).values({
        sessionId,
        role: 'assistant',
        content: result.feedback,
        snapshot: result.snapshot,
      })

      // Reply on the SAME wire format the client already parses:
      // feedback text + delimiter + snapshot JSON.
      const body =
        result.feedback + SNAPSHOT_DELIMITER + JSON.stringify(result.snapshot)

      return new Response(body, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      })
    }
    // Unrecognised command → fall through to normal handling.
  }

  // Save the player's message before streaming
  await db.insert(messagesTable).values({
    sessionId,
    role: 'user',
    content: message,
    snapshot: null,
  })

  const claudeMessages = buildClaudeMessages(context.history, message)

  return streamGameResponse({ sessionId, context, claudeMessages })
}

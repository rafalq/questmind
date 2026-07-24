import { db } from '@/db'
import { messagesTable } from '@/db/schema'
import { buildClaudeMessages } from '@/features/session/lib/build-claude-messages'
import {
  applyDebugCommand,
  isDebugCommand,
  isDebugEnabled,
} from '@/features/session/lib/debug-commands'
import {
  applyXpCommand,
  type DebugResult,
} from '@/features/session/lib/debug-xp'
import { SNAPSHOT_DELIMITER } from '@/features/session/lib/stream-protocol'
import { streamGameResponse } from '@/features/session/lib/stream-game-response'
import { validateSession } from '@/features/session/lib/validate-session'
import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'

export const runtime = 'edge'

const schema = z.object({
  sessionId: z.string().uuid(),
  message: z.string().trim().min(1),
})

/**
 * Debug replies go out on the same wire format a real turn uses - narrative
 * text, delimiter, snapshot JSON - so the client parses them with the code it
 * already has and needs no debug branch of its own.
 */
function debugResponse({ feedback, snapshot }: DebugResult): Response {
  return new Response(
    feedback + SNAPSHOT_DELIMITER + JSON.stringify(snapshot),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  )
}

export async function POST(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const parsed = schema.safeParse(await req.json())
  if (!parsed.success) return new Response('Bad request', { status: 400 })

  const { sessionId, message } = parsed.data

  const context = await validateSession(sessionId, userId)
  if (!context)
    return new Response('Session not found or inactive', { status: 404 })

  // DEV-ONLY debug command interception. Hard-gated: no-op in production
  // regardless of input. An unrecognised command falls through to a normal
  // turn, so a typo is narrated rather than swallowed.
  if (isDebugEnabled() && isDebugCommand(message)) {
    const result =
      (await applyXpCommand({
        message,
        characterId: context.character.id,
        world: context.character.world,
        characterClass: context.character.characterClass,
        baseAttributes: context.baseAttributes,
        lastSnapshot: context.lastSnapshot,
      })) ?? applyDebugCommand(message, context.lastSnapshot)

    if (result) {
      // Persisted exactly like a real assistant turn, so resume and history
      // stay consistent with what the player saw.
      await db.insert(messagesTable).values({
        sessionId,
        role: 'assistant',
        content: result.feedback,
        snapshot: result.snapshot,
      })

      return debugResponse(result)
    }
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

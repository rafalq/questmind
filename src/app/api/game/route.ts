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
import { charactersTable, messagesTable } from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'
import { levelFromXp } from '@/features/character/constants/progression'
import {
  effectiveAttributes,
  computeTier,
} from '@/features/character/lib/progression'
import { calculateMaxHp } from '@/features/character/lib/hp'
import { getWorld } from '@/worlds'
import { eq } from 'drizzle-orm'

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
    // /set xp lives here, not in debug-commands.ts, because XP is stored in
    // charactersTable, not in the snapshot. That module is a pure
    // snapshot→snapshot function with no database access, and keeping it that
    // way is what makes it unit-testable. Every other debug command is a pure
    // snapshot mutation and stays there.
    const xpMatch = message.trim().match(/^\/set\s+xp\s+(\d+)$/i)

    if (xpMatch && context.lastSnapshot) {
      const classDef = getWorld(context.character.world).classes.find(
        (c) => c.value === context.character.characterClass
      )

      if (classDef) {
        const xp = Number(xpMatch[1])
        const level = levelFromXp(xp)
        const attributes = effectiveAttributes(
          context.baseAttributes,
          classDef,
          level
        )
        const tier = computeTier(level, attributes[classDef.keyAttribute])

        // characterXp is the single source of truth. Level and tier are always
        // derived from it and never stored.
        await db
          .update(charactersTable)
          .set({ characterXp: xp })
          .where(eq(charactersTable.id, context.character.id))

        const snapshot: GameSnapshot = {
          ...context.lastSnapshot,
          xp,
          level,
          tier,
          maxHp: calculateMaxHp(attributes.endurance),
        }

        const feedback = `[debug] xp set to ${xp} (level ${level}, tier ${tier})`

        await db.insert(messagesTable).values({
          sessionId,
          role: 'assistant',
          content: feedback,
          snapshot,
        })

        return new Response(
          feedback + SNAPSHOT_DELIMITER + JSON.stringify(snapshot),
          { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
        )
      }
    }

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

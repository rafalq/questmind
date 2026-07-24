import { type GameSnapshot } from '@/db/schema/session'
import { anthropic } from '@/lib/ai/client'
import { AI_MODEL, MAX_TOKENS } from '@/lib/ai/config'
import { type Genre } from '@/worlds/schema/primitives'
import { applyTurnEffects } from './apply-turn-effects'
import { SEPARATOR } from './build-system-prompt/'
import { buildTurnRequest } from './build-turn-request'
import { extractSnapshot } from './extract-snapshot'
import { persistTurn } from './persist-turn'
import { streamUntilSeparator } from './separator-stream'
import { SNAPSHOT_DELIMITER } from './stream-protocol'
import { type SessionContext } from './validate-session'

type StreamInput = {
  sessionId: string
  context: SessionContext
  claudeMessages: { role: 'user' | 'assistant'; content: string }[]
}

/**
 * One turn of play, start to finish.
 *
 * This function is deliberately only the sequence. Each step below is a module
 * of its own, because they fail independently and are worth reading
 * independently: prompt assembly is pure string work, the stream is a wire
 * protocol, snapshot extraction is parsing and recovery, turn effects are the
 * game rules, and persistence is the database.
 *
 * The order is load-bearing and is the one thing this file asserts:
 * the player sees prose before any of it is validated or written, and nothing
 * is persisted until the model has finished speaking.
 */
export function streamGameResponse({
  sessionId,
  context,
  claudeMessages,
}: StreamInput): Response {
  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const { system, messages, activeAbilities, classDef, validSceneTags } =
        await buildTurnRequest({ context, claudeMessages })

      const events = anthropic.messages.stream({
        model: AI_MODEL,
        max_tokens: MAX_TOKENS.turn,
        system,
        messages,
      })

      // Prose reaches the player as it arrives; everything after the separator
      // is held back and parsed below.
      const { full, separatorIndex } = await streamUntilSeparator({
        events,
        separator: SEPARATOR,
        emit: (text) => controller.enqueue(encoder.encode(text)),
      })

      // TODO(logging): drop once the model reliably emits a separator every
      // time. It should never stop without one, but it does, and the stop
      // reason is the only way to tell a truncation from a refusal.
      const final = await events.finalMessage()
      console.log(
        'STOP REASON:',
        final.stop_reason,
        '| in:',
        final.usage.input_tokens,
        '| out:',
        final.usage.output_tokens
      )

      let snapshot: GameSnapshot | null = await extractSnapshot({
        full,
        separatorIndex,
        lastSnapshot: context.lastSnapshot,
        validSceneTags,
        sessionId,
      })

      if (snapshot) {
        snapshot = await applyTurnEffects({
          snapshot,
          context,
          classDef,
          activeAbilities,
        })
      }

      const narrative =
        separatorIndex !== -1
          ? full.slice(0, separatorIndex).trim()
          : full.trim()

      await persistTurn({
        sessionId,
        campaignId: context.campaign.id,
        genre: context.campaign.genre as Genre,
        narrative,
        snapshot,
      })

      // Send the snapshot to the client so it can apply the delta immediately,
      // with no separate refetch round-trip.
      if (snapshot) {
        controller.enqueue(
          encoder.encode(SNAPSHOT_DELIMITER + JSON.stringify(snapshot))
        )
      }

      controller.close()
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
    },
  })
}

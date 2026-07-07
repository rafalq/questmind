import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/db'
import { campaignsTable, messagesTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { type GameSnapshot } from '@/db/schema/session'
import { type SessionContext } from './validate-session'
import { buildSystemPrompt, SEPARATOR } from './build-system-prompt'
import { SNAPSHOT_DELIMITER } from './stream-protocol'

const client = new Anthropic()

type StreamInput = {
  sessionId: string
  context: SessionContext
  claudeMessages: { role: 'user' | 'assistant'; content: string }[]
}

export function streamGameResponse({
  sessionId,
  context,
  claudeMessages,
}: StreamInput): Response {
  const { campaign, character, lastSnapshot } = context

  const systemPrompt = buildSystemPrompt(
    campaign.genre,
    character.name,
    character.characterClass,
    character.race
  )

  const fullSystem = lastSnapshot
    ? `${systemPrompt}\n\nCurrent game state:\n${JSON.stringify(lastSnapshot)}`
    : systemPrompt

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      let fullText = ''
      // Track how many characters of narrative we have already sent
      // so we can flush the remainder when the separator is found mid-chunk.
      let sentUpTo = 0

      const stream = await client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1024,
        system: fullSystem,
        messages: claudeMessages,
      })

      for await (const chunk of stream) {
        if (
          chunk.type === 'content_block_delta' &&
          chunk.delta.type === 'text_delta'
        ) {
          fullText += chunk.delta.text

          const separatorIndex = fullText.indexOf(SEPARATOR)

          if (separatorIndex === -1) {
            // Separator not yet complete in the buffer. Hold back the last
            // (SEPARATOR.length - 1) chars — they might be the beginning of a
            // separator that only finishes in a later chunk. Without this, a
            // partial "---JSON" leaks into the narrative before the closing
            // "---" arrives, because indexOf still returns -1 mid-separator.
            const safeUpTo = fullText.length - (SEPARATOR.length - 1)
            if (safeUpTo > sentUpTo) {
              controller.enqueue(
                encoder.encode(fullText.slice(sentUpTo, safeUpTo))
              )
              sentUpTo = safeUpTo
            }
          } else if (sentUpTo < separatorIndex) {
            // Separator is now complete — flush any unsent narrative that
            // sits before it (including the chars we were holding back).
            const remaining = fullText.slice(sentUpTo, separatorIndex)
            if (remaining) {
              controller.enqueue(encoder.encode(remaining))
            }
            sentUpTo = separatorIndex
            // Don't break — let the stream finish so we collect the full JSON.
          }
          // If sentUpTo >= separatorIndex we are past the separator already,
          // just accumulate the JSON tail silently.
        }
      }

      // ── Parse JSON snapshot ───────────────────────────────────────────

      const separatorIndex = fullText.indexOf(SEPARATOR)
      let snapshot: GameSnapshot | null = null

      if (separatorIndex !== -1) {
        const jsonStr = fullText.slice(separatorIndex + SEPARATOR.length).trim()
        try {
          snapshot = JSON.parse(jsonStr)
        } catch {
          console.error('Failed to parse game snapshot:', jsonStr)
        }
      }

      const narrative =
        separatorIndex !== -1
          ? fullText.slice(0, separatorIndex).trim()
          : fullText.trim()

      // ── Persist to database ───────────────────────────────────────────

      await Promise.all([
        db.insert(messagesTable).values({
          sessionId,
          role: 'assistant',
          content: narrative,
          snapshot,
        }),
        db
          .update(campaignsTable)
          .set({ lastPlayedAt: new Date() })
          .where(eq(campaignsTable.id, context.campaign.id)),
      ])

      // Send the parsed snapshot to the client so it can apply the delta
      // immediately — no separate refetch round-trip.
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

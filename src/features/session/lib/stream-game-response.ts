import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/db'
import { campaignsTable, messagesTable } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { type GameSnapshot } from '@/db/schema/session'
import { type SessionContext } from './validate-session'
import { buildSystemPrompt, SEPARATOR } from './build-system-prompt/'
import { SNAPSHOT_DELIMITER } from './stream-protocol'
import { getLanguage } from '@/features/campaign/constants/languages'

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

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      const systemPrompt = await buildSystemPrompt({
        genre: campaign.genre as 'fantasy' | 'sci-fi' | 'cyberpunk',
        player: {
          campaignId: campaign.id,
          characterName: character.name,
          race: character.race,
          characterClass: character.characterClass,
          gender: character.gender,
        },
        language: campaign.language,
      })

      // Base prompt + optional current-state blob (both English).
      const baseSystem = lastSnapshot
        ? `${systemPrompt}\n\nCurrent game state:\n${JSON.stringify(lastSnapshot)}`
        : systemPrompt

      // Terminal language directive — the LAST thing the model reads before
      // generating. The `## Language` block inside the builder explains the
      // full rule, but it sits before ~2k tokens of English lore, GM
      // instructions and the state blob above, so recency pulls the model
      // back into English. Repeating the imperative at the very end (after
      // the state blob) is what actually holds the narration language.
      // English needs nothing — it's the default and the JSON is English too.
      const fullSystem =
        campaign.language === 'en'
          ? baseSystem
          : `${baseSystem}\n\n---\n\nOUTPUT LANGUAGE: Write every word of narrative, dialogue and description in ${getLanguage(campaign.language).promptName}. This overrides the language of any lore or state text above. Only the machine-readable block after "${SEPARATOR}" stays in English — English keys, English values.`

      let fullText = ''

      // Track how many characters of narrative we have already sent
      // so we can flush the remainder when the separator is found mid-chunk.
      let sentUpTo = 0

      const stream = client.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
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

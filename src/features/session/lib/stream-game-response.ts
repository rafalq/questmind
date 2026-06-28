import Anthropic from '@anthropic-ai/sdk'
import { db } from '@/db'
import { messagesTable } from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'
import { type SessionContext } from './validate-session'
import { buildSystemPrompt, SEPARATOR } from './build-system-prompt'

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
            // Separator not yet seen — stream the new chunk directly.
            controller.enqueue(encoder.encode(chunk.delta.text))
            sentUpTo = fullText.length
          } else if (sentUpTo < separatorIndex) {
            // Separator appeared in this chunk or a previous one but we have
            // unsent narrative before it — flush that remainder now.
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

      await db.insert(messagesTable).values({
        sessionId,
        role: 'assistant',
        content: narrative,
        snapshot,
      })

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

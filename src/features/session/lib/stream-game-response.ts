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

          // Only stream narrative text to the client — stop at the separator
          const separatorIndex = fullText.indexOf(SEPARATOR)
          if (separatorIndex === -1) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      }

      // Parse the JSON snapshot from the end of the full response
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

      // Save the assistant's response and game state snapshot to the database
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

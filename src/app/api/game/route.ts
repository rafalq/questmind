import { auth } from '@clerk/nextjs/server'
import { validateSession } from '@/features/session/lib/validate-session'
import { buildClaudeMessages } from '@/features/session/lib/build-claude-messages'
import { streamGameResponse } from '@/features/session/lib/stream-game-response'
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

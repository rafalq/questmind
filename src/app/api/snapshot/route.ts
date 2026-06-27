import { auth } from '@clerk/nextjs/server'
import { db } from '@/db'
import { messagesTable, sessionsTable } from '@/db/schema'
import { eq, and, desc } from 'drizzle-orm'

export const runtime = 'edge'

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return new Response('Unauthorized', { status: 401 })

  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get('sessionId')
  if (!sessionId) return new Response('Bad request', { status: 400 })

  // Verify the session belongs to this user
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(
      and(eq(sessionsTable.id, sessionId), eq(sessionsTable.userId, userId))
    )

  if (!session) return new Response('Not found', { status: 404 })

  // Get the most recent assistant message with a snapshot
  const [message] = await db
    .select()
    .from(messagesTable)
    .where(
      and(
        eq(messagesTable.sessionId, sessionId),
        eq(messagesTable.role, 'assistant')
      )
    )
    .orderBy(desc(messagesTable.createdAt))
    .limit(1)

  return Response.json({ snapshot: message?.snapshot ?? null })
}

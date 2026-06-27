import { db } from '@/db'
import {
  sessionsTable,
  messagesTable,
  campaignsTable,
  charactersTable,
} from '@/db/schema'
import { auth } from '@clerk/nextjs/server'
import { eq, and, asc } from 'drizzle-orm'

export async function getSession(sessionId: string) {
  const { userId } = await auth()
  if (!userId) return null

  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(
      and(eq(sessionsTable.id, sessionId), eq(sessionsTable.userId, userId))
    )

  if (!session) return null

  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, session.campaignId))

  const [character] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, session.characterId))

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(asc(messagesTable.createdAt))

  return { session, campaign, character, messages }
}

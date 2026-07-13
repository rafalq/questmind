import { db } from '@/db'
import {
  sessionsTable,
  campaignsTable,
  charactersTable,
  characterAttributesTable,
  messagesTable,
} from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { type GameSnapshot } from '@/db/schema/session'
import { Attribute } from '@/worlds/schema'

export type SessionContext = {
  session: typeof sessionsTable.$inferSelect
  campaign: typeof campaignsTable.$inferSelect
  character: typeof charactersTable.$inferSelect
  history: (typeof messagesTable.$inferSelect)[]
  lastSnapshot: GameSnapshot | null
  baseAttributes: Record<Attribute, number>
}

export async function validateSession(
  sessionId: string,
  userId: string
): Promise<SessionContext | null> {
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(
      and(eq(sessionsTable.id, sessionId), eq(sessionsTable.userId, userId))
    )

  if (!session || session.status !== 'active') return null

  const [campaign] = await db
    .select()
    .from(campaignsTable)
    .where(eq(campaignsTable.id, session.campaignId))

  const [character] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, session.characterId))

  const history = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.sessionId, sessionId))
    .orderBy(asc(messagesTable.createdAt))

  const lastSnapshot =
    ([...history].reverse().find((m) => m.snapshot)
      ?.snapshot as GameSnapshot) ?? null

  const attributeRows = await db
    .select()
    .from(characterAttributesTable)
    .where(eq(characterAttributesTable.characterId, session.characterId))

  const baseAttributes = Object.fromEntries(
    attributeRows.map((row) => [row.attribute, row.baseValue])
  ) as Record<Attribute, number>

  return {
    session,
    campaign,
    character,
    history,
    lastSnapshot,
    baseAttributes,
  }
}

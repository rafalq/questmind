import { db } from '@/db'
import {
  sessionsTable,
  campaignsTable,
  charactersTable,
  campaignCharactersTable,
  messagesTable,
} from '@/db/schema'
import { eq, and, asc } from 'drizzle-orm'
import { type GameSnapshot } from '@/db/schema/session'
import { Attribute } from '@/worlds/schema'
import { getBaseAttributes } from '@/features/character/queries/get-base-attributes'

export type SessionContext = {
  session: typeof sessionsTable.$inferSelect
  campaign: typeof campaignsTable.$inferSelect
  character: typeof charactersTable.$inferSelect
  campaignCharacter: typeof campaignCharactersTable.$inferSelect
  history: (typeof messagesTable.$inferSelect)[]
  lastSnapshot: GameSnapshot | null
  baseAttributes: Record<Attribute, number>
}

export async function validateSession(
  sessionId: string,
  userId: string
): Promise<SessionContext | null> {
  // Auth/ownership gate — must run first and alone: it gates the early return
  // below, and every other query depends on session.campaignId / characterId.
  const [session] = await db
    .select()
    .from(sessionsTable)
    .where(
      and(eq(sessionsTable.id, sessionId), eq(sessionsTable.userId, userId))
    )

  if (!session || session.status !== 'active') return null

  // The remaining five reads are independent of each other, so batch them into
  // a single round-trip's worth of parallel awaits: 6 sequential -> 2 total.
  //
  // Intentional behavioural tradeoff: previously a missing campaignCharacter
  // returned BEFORE history/baseAttributes were fetched. Now all five fire
  // before that guard, so the missing-campaignCharacter path does a little
  // extra work. That's an error-path edge case, not the hot path — acceptable.
  const [
    [campaign],
    [character],
    [campaignCharacter],
    history,
    baseAttributes,
  ] = await Promise.all([
    db
      .select()
      .from(campaignsTable)
      .where(eq(campaignsTable.id, session.campaignId)),
    db
      .select()
      .from(charactersTable)
      .where(eq(charactersTable.id, session.characterId)),
    db
      .select()
      .from(campaignCharactersTable)
      .where(
        and(
          eq(campaignCharactersTable.campaignId, session.campaignId),
          eq(campaignCharactersTable.characterId, session.characterId)
        )
      ),
    db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.sessionId, sessionId))
      .orderBy(asc(messagesTable.createdAt)),
    getBaseAttributes(session.characterId),
  ])

  if (!campaignCharacter) return null

  const lastSnapshot =
    ([...history].reverse().find((m) => m.snapshot)
      ?.snapshot as GameSnapshot) ?? null

  return {
    session,
    campaign,
    character,
    campaignCharacter,
    history,
    lastSnapshot,
    baseAttributes,
  }
}

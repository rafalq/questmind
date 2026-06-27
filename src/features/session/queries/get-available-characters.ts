import { db } from '@/db'
import { sessionsTable, charactersTable } from '@/db/schema'
import { eq, and, notInArray } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'

export async function getAvailableCharacters(genre: 'fantasy' | 'sci-fi' | 'cyberpunk') {
  const { userId } = await auth()
  if (!userId) return []

  // Find all character IDs currently in an active session
  const activeSessions = await db
    .select({ characterId: sessionsTable.characterId })
    .from(sessionsTable)
    .where(eq(sessionsTable.status, 'active'))

  const busyCharacterIds = activeSessions.map((s) => s.characterId)

  const conditions = [
    eq(charactersTable.userId, userId),
    eq(charactersTable.genre, genre),
    eq(charactersTable.isAlive, true),
  ]

  // Only filter out busy characters if there are any
  if (busyCharacterIds.length > 0) {
    conditions.push(notInArray(charactersTable.id, busyCharacterIds))
  }

  return db.select().from(charactersTable).where(and(...conditions))
}
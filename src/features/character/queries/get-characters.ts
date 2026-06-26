import { db } from '@/db'
import { charactersTable, characterAttributesTable } from '@/db/schema'
import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'

export const getCharacters = async () => {
  const { userId } = await auth()
  if (!userId) return []

  const characters = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.userId, userId))
    .orderBy(charactersTable.createdAt)

  return characters
}

export const getCharacterWithAttributes = async (characterId: string) => {
  const { userId } = await auth()
  if (!userId) return null

  const [character] = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.id, characterId))

  if (!character || character.userId !== userId) return null

  const attributes = await db
    .select()
    .from(characterAttributesTable)
    .where(eq(characterAttributesTable.characterId, characterId))

  return { ...character, attributes }
}

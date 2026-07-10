import { db } from '@/db'
import {
  campaignCharactersTable,
  campaignsTable,
  characterAttributesTable,
  charactersTable,
  sessionsTable,
} from '@/db/schema'
import { auth } from '@clerk/nextjs/server'
import { and, eq, isNotNull } from 'drizzle-orm'

export const getCharacters = async () => {
  const { userId } = await auth()
  if (!userId) return []

  const characters = await db
    .select()
    .from(charactersTable)
    .where(eq(charactersTable.userId, userId))
    .orderBy(charactersTable.createdAt)

  // For each character, find the active campaign (if any)
  const enriched = await Promise.all(
    characters.map(async (character) => {
      const [link] = await db
        .select({
          campaignId: campaignCharactersTable.campaignId,
          campaignName: campaignsTable.name,
          currentHp: campaignCharactersTable.currentHp,
          maxHp: campaignCharactersTable.maxHp,
          sessionId: sessionsTable.id,
        })
        .from(campaignCharactersTable)
        .innerJoin(
          campaignsTable,
          eq(campaignCharactersTable.campaignId, campaignsTable.id)
        )
        .innerJoin(
          sessionsTable,
          and(
            eq(sessionsTable.campaignId, campaignCharactersTable.campaignId),
            eq(sessionsTable.status, 'active')
          )
        )
        .where(
          and(
            eq(campaignCharactersTable.characterId, character.id),
            eq(campaignCharactersTable.status, 'active'),
            isNotNull(campaignCharactersTable.campaignId)
          )
        )
        .limit(1)

      const attributes = await db
        .select({
          attributeName: characterAttributesTable.attribute,
          value: characterAttributesTable.baseValue,
        })
        .from(characterAttributesTable)
        .where(eq(characterAttributesTable.characterId, character.id))

      return {
        ...character,
        attributes,
        activeCampaign: link ?? null,
      }
    })
  )

  return enriched
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

'use server'

import { db } from '@/db'
import { charactersTable, characterAttributesTable } from '@/db/schema'
import { revalidatePath } from 'next/cache'
import { authActionClient } from '@/lib/safe-action'
import { z } from 'zod'
import {
  ATTRIBUTE_MIN,
  ATTRIBUTE_MAX,
  POINT_BUY_TOTAL,
  calculateAttributeTotal,
  RACES_BY_GENRE,
  CLASSES_BY_GENRE,
} from '@/features/character/constants'

const ATTRIBUTES = [
  'strength',
  'mind',
  'endurance',
  'agility',
  'charisma',
  'perception',
] as const

const attributesSchema = z.object({
  strength: z.number().int().min(ATTRIBUTE_MIN).max(ATTRIBUTE_MAX),
  mind: z.number().int().min(ATTRIBUTE_MIN).max(ATTRIBUTE_MAX),
  endurance: z.number().int().min(ATTRIBUTE_MIN).max(ATTRIBUTE_MAX),
  agility: z.number().int().min(ATTRIBUTE_MIN).max(ATTRIBUTE_MAX),
  charisma: z.number().int().min(ATTRIBUTE_MIN).max(ATTRIBUTE_MAX),
  perception: z.number().int().min(ATTRIBUTE_MIN).max(ATTRIBUTE_MAX),
})

const schema = z.object({
  name: z.string().min(1).max(60),
  genre: z.enum(['fantasy', 'sci-fi', 'cyberpunk']),
  race: z.string().min(1),
  characterClass: z.string().min(1),
  backgroundStory: z.string().max(1000).optional(),
  attributes: attributesSchema,
})

export const createCharacter = authActionClient
  .inputSchema(schema)
  .metadata({ actionName: 'createCharacter' })
  .action(async ({ parsedInput, ctx }) => {
    const { name, genre, race, characterClass, backgroundStory, attributes } =
      parsedInput

    // Walidacja sumy punktów
    const totalSpent = Object.values(attributes).reduce((sum, v) => sum + v, 0)
    if (totalSpent !== POINT_BUY_TOTAL) {
      throw new Error(
        `Point total must equal ${POINT_BUY_TOTAL}. Got ${totalSpent}.`
      )
    }

    // Pobierz modyfikatory rasy i klasy
    const raceDef = RACES_BY_GENRE[genre].find((r) => r.value === race)
    const classDef = CLASSES_BY_GENRE[genre].find(
      (c) => c.value === characterClass
    )

    if (!raceDef || !classDef) {
      throw new Error('Invalid race or class for selected genre.')
    }

    // Wstaw postać
    const [character] = await db
      .insert(charactersTable)
      .values({
        userId: ctx.userId,
        name,
        genre: genre as 'fantasy' | 'sci-fi' | 'cyberpunk',
        race: race as any,
        characterClass: characterClass as any,
        backgroundStory: backgroundStory ?? null,
        avatarUrl: null,
      })
      .returning()

    // Wstaw atrybuty
    const attributeRows = ATTRIBUTES.map((attr) => ({
      characterId: character.id,
      attribute: attr,
      baseValue: calculateAttributeTotal(
        attributes[attr],
        raceDef.modifiers[attr] ?? 0,
        classDef.modifiers[attr] ?? 0
      ),
      currentXp: 0,
      bonus: 0,
    }))

    await db.insert(characterAttributesTable).values(attributeRows)

    revalidatePath('/dashboard/characters')

    return { characterId: character.id }
  })

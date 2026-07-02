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
  RACES_BY_WORLD,
  CLASSES_BY_WORLD,
  WORLD_GENDER_OPTIONS,
  GENRE_BY_WORLD,
  WORLDS,
  World,
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

// Built from WORLDS so a future second world extends this automatically.
// Cast to World (not string) so z.enum infers the literal union, and
// parsedInput.world stays type-safe for indexing RACES_BY_WORLD etc.
const WORLD_VALUES = WORLDS.map((w) => w.value) as [World, ...World[]]

const schema = z.object({
  name: z.string().min(1).max(60),
  world: z.enum(WORLD_VALUES),
  race: z.string().min(1),
  gender: z.string().optional(),
  characterClass: z.string().min(1),
  attributes: attributesSchema,
})

export const createCharacter = authActionClient
  .inputSchema(schema)
  .metadata({ actionName: 'createCharacter' })
  .action(async ({ parsedInput, ctx }) => {
    const { name, world, race, gender, characterClass, attributes } =
      parsedInput

    // Walidacja sumy punktów
    const totalSpent = Object.values(attributes).reduce((sum, v) => sum + v, 0)
    if (totalSpent !== POINT_BUY_TOTAL) {
      throw new Error(
        `Point total must equal ${POINT_BUY_TOTAL}. Got ${totalSpent}.`
      )
    }

    // genre is derived server-side from world — never trust a client-supplied genre
    const genre = GENRE_BY_WORLD[world]

    const raceDef = RACES_BY_WORLD[world]?.find((r) => r.value === race)
    const classDef = CLASSES_BY_WORLD[world]?.find(
      (c) => c.value === characterClass
    )

    if (!raceDef || !classDef) {
      throw new Error('Invalid race or class for selected world.')
    }

    // Genderless races (e.g. demigod) must not carry a gender; every other
    // race must specify one that's valid for this world.
    let genderDef = null
    if (raceDef.genderless) {
      if (gender) {
        throw new Error('This race does not have a sex.')
      }
    } else {
      genderDef = WORLD_GENDER_OPTIONS[world]?.find((g) => g.id === gender)
      if (!genderDef) {
        throw new Error('A valid sex must be selected for this race.')
      }
    }

    // Wstaw postać
    const [character] = await db
      .insert(charactersTable)
      .values({
        userId: ctx.userId,
        name,
        genre,
        world,
        race,
        gender: gender ?? null,
        characterClass,
        avatarUrl: null,
      })
      .returning()

    // Wstaw atrybuty — race, class, and gender modifiers all combined
    const attributeRows = ATTRIBUTES.map((attr) => ({
      characterId: character.id,
      attribute: attr,
      baseValue: calculateAttributeTotal(
        attributes[attr],
        (raceDef.modifiers[attr] ?? 0) + (genderDef?.statModifiers[attr] ?? 0),
        classDef.modifiers[attr] ?? 0
      ),
      currentXp: 0,
      bonus: 0,
    }))

    await db.insert(characterAttributesTable).values(attributeRows)

    revalidatePath('/dashboard/characters')

    return { characterId: character.id }
  })

// src/features/character/queries/get-base-attributes.ts
import { db } from '@/db'
import { characterAttributesTable } from '@/db/schema'
import type { Attribute } from '@/worlds/schema'
import { eq } from 'drizzle-orm'

/**
 * Base attributes as stored: point-buy plus race, class and gender modifiers,
 * applied once at character creation. Per-level growth is NOT included — that
 * is derived on read via effectiveAttributes(), so levelling never needs a
 * write.
 */
export async function getBaseAttributes(
  characterId: string
): Promise<Record<Attribute, number>> {
  const rows = await db
    .select()
    .from(characterAttributesTable)
    .where(eq(characterAttributesTable.characterId, characterId))

  return Object.fromEntries(
    rows.map((row) => [row.attribute, row.baseValue])
  ) as Record<Attribute, number>
}

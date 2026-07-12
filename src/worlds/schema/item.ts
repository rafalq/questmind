import { z } from 'zod'

// ---------------------------------------------------------------------------
// Items — display metadata for inventory entries
// ---------------------------------------------------------------------------

export const ITEM_CATEGORIES = [
  'weapon',
  'armor',
  'consumable',
  'tool',
  'relic',
  'misc',
] as const

export const ItemCategorySchema = z.enum(ITEM_CATEGORIES)
export type ItemCategory = z.infer<typeof ItemCategorySchema>

/**
 * Display metadata for an inventory entry, keyed by the item name stored in
 * GameSnapshot.inventory. Authored per world; items the GM invents at runtime
 * (loot, /additem) simply won't be found here — the UI must fall back.
 */
export const ItemDefinitionSchema = z.object({
  description: z.string().min(1),
  category: ItemCategorySchema,
  /**
   * Carry weight in abstract slots. Unused at runtime for now — reserved for
   * the encumbrance system (see docs/future/data-model.md). Authored upfront
   * so item data doesn't need revisiting when capacity rules land.
   */
  slots: z.number().int().positive().default(1),
})

export type ItemDefinition = z.infer<typeof ItemDefinitionSchema>

// ---------------------------------------------------------------------------
// Starting equipment
// ---------------------------------------------------------------------------

export const StartingItemSchema = z.object({
  name: z.string().min(1),
  qty: z.number().int().positive(),
  slots: z.number().int().positive().default(1),
})

export type StartingItem = z.infer<typeof StartingItemSchema>

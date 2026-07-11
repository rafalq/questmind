// src/features/session/lib/inventory-display.ts
import { getWorld } from '@/worlds'
import type { ItemCategory } from '@/worlds/schema'

export type InventoryEntry = {
  name: string
  qty: number
  /** Undefined for items the GM invented at runtime (loot, /additem). */
  description?: string
  /** Falls back to 'misc' for unknown items. */
  category: ItemCategory
}

/**
 * Turns GameSnapshot.inventory (a flat string[] with repeated entries) into
 * grouped, described rows for the stats panel. Insertion order is preserved,
 * so starting equipment stays in its authored order and loot appends at the end.
 */
export function buildInventoryDisplay(
  inventory: string[],
  world: string
): InventoryEntry[] {
  const items = getWorld(world).items

  const grouped = new Map<string, number>()
  for (const name of inventory) {
    grouped.set(name, (grouped.get(name) ?? 0) + 1)
  }

  return [...grouped].map(([name, qty]) => {
    const def = items[name]
    return {
      name,
      qty,
      description: def?.description,
      category: def?.category ?? 'misc',
    }
  })
} // src/features/session/lib/inventory-display.ts
import { getWorld } from '@/worlds'
import type { ItemCategory } from '@/worlds/schema'

export type InventoryEntry = {
  name: string
  qty: number
  /** Undefined for items the GM invented at runtime (loot, /additem). */
  description?: string
  /** Falls back to 'misc' for unknown items. */
  category: ItemCategory
}

/**
 * Turns GameSnapshot.inventory (a flat string[] with repeated entries) into
 * grouped, described rows for the stats panel. Insertion order is preserved,
 * so starting equipment stays in its authored order and loot appends at the end.
 */
export function buildInventoryDisplay(
  inventory: string[],
  world: string
): InventoryEntry[] {
  const items = getWorld(world).items

  const grouped = new Map<string, number>()
  for (const name of inventory) {
    grouped.set(name, (grouped.get(name) ?? 0) + 1)
  }

  return [...grouped].map(([name, qty]) => {
    const def = items[name]
    return {
      name,
      qty,
      description: def?.description,
      category: def?.category ?? 'misc',
    }
  })
}

import type { StartingItem } from './schema'

/**
 * Merges starting equipment from multiple sources (race + class) and flattens
 * it into the flat string[] shape stored in charactersTable.inventory.
 * Quantities become repeated entries:
 * { name: 'Iron Ration', qty: 3 } → ['Iron Ration', 'Iron Ration', 'Iron Ration']
 */
export function buildStartingInventory(...sources: StartingItem[][]): string[] {
  return sources
    .flat()
    .flatMap(({ name, qty }) => Array<string>(qty).fill(name))
}

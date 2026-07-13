// src/features/session/lib/snapshot-diff.ts
import { type GameSnapshot } from '@/db/schema/session'

export type SnapshotChange =
  | { kind: 'ability'; name: string }
  | { kind: 'hp'; delta: number }
  | { kind: 'item-gained'; name: string; qty: number }
  | { kind: 'item-lost'; name: string; qty: number }
  | { kind: 'quest-added'; title: string }
  | { kind: 'quest-completed'; title: string }
  | { kind: 'level-up'; level: number; tier: number }

/** Counts occurrences in the flat inventory array. */
function countItems(inventory: string[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const name of inventory) {
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return counts
}

/**
 * Derives what changed between two snapshots. This is the single source of
 * truth for "what happened mechanically" — the GM narrates consequences in
 * prose but must never report numbers; those come from here, deterministically.
 *
 * Returns [] when there is no previous snapshot (first turn) or nothing changed.
 */
export function diffSnapshots(
  prev: GameSnapshot | null,
  next: GameSnapshot | null
): SnapshotChange[] {
  const changes: SnapshotChange[] = []

  // Not a delta: abilityUsed is a fact about this turn, not a difference
  // between two states. It must be read before the guard below, or an ability
  // used on the very first turn (prev === null) would be dropped.
  if (next?.abilityUsed) {
    changes.push({ kind: 'ability', name: next.abilityUsed })
  }

  if (!prev || !next) return changes

  // HP
  if (next.hp !== prev.hp) {
    changes.push({ kind: 'hp', delta: next.hp - prev.hp })
  }

  // Level / tier
  if (next.level > prev.level) {
    changes.push({ kind: 'level-up', level: next.level, tier: next.tier })
  }

  // Inventory — compare counts, so { 3 bandages → 1 bandage } reads as -2.
  const before = countItems(prev.inventory)
  const after = countItems(next.inventory)

  for (const [name, qty] of after) {
    const diff = qty - (before.get(name) ?? 0)
    if (diff > 0) changes.push({ kind: 'item-gained', name, qty: diff })
  }
  for (const [name, qty] of before) {
    const diff = qty - (after.get(name) ?? 0)
    if (diff > 0) changes.push({ kind: 'item-lost', name, qty: diff })
  }

  // Quests — keyed by id, since titles can be reworded by the model.
  const prevQuests = new Map(prev.quests.map((q) => [q.id, q]))

  for (const quest of next.quests) {
    const old = prevQuests.get(quest.id)
    if (!old) {
      changes.push({ kind: 'quest-added', title: quest.title })
    } else if (old.status !== 'completed' && quest.status === 'completed') {
      changes.push({ kind: 'quest-completed', title: quest.title })
    }
  }

  return changes
}

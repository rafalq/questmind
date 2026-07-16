// src/features/session/lib/lore-writer/resolve.ts
// Pure resolution helpers for the dynamic RAG write layer.
// No database access — every function here is a function of its arguments,
// so it is unit-testable without a Neon connection.

/**
 * The model names NPCs in prose; campaignLoreState stores npc_characters.id.
 * Names therefore arrive dirty: the GM narrates in Polish, drops a fada,
 * doubles a space, capitalises differently. Normalising both sides absorbs
 * that — while keeping the comparison whole-name and exact.
 *
 * Deliberately NOT fuzzy. A near-miss is dropped, never guessed: linking the
 * player to the wrong NPC would corrupt cross-campaign memory silently, and
 * nothing downstream could detect it. Not remembering a meeting is a small
 * loss; remembering one that never happened is a lie the world then tells back
 * to the player.
 */
export function normalizeNpcName(name: string): string {
  return name
    .normalize('NFD') // á → a + ◌́
    .replace(/[\u0300-\u036f]/g, '') // drop the combining marks
    .replace(/ł/g, 'l') // Polish ł has no NFD decomposition
    .replace(/Ł/g, 'L')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

/** Minimal shape needed from npcCharactersTable — keeps this file DB-free. */
export type NpcRef = { id: string; name: string }

export type ResolvedNpcs = {
  /** ids of authored NPCs the model named */
  ids: string[]
  /** names matching no authored NPC — improvised by the GM, not persisted */
  unknown: string[]
}

/**
 * Maps model-supplied names onto authored NPC ids.
 *
 * Unmatched names are expected, not exceptional: the GM invents NPCs freely — a
 * beggar, a dock guard — and those have no row in npc_characters. They are
 * returned separately rather than swallowed, so a name that *should* have
 * matched and didn't shows up in the logs as the data bug it is.
 */
export function resolveNpcIds(
  names: string[],
  authored: NpcRef[]
): ResolvedNpcs {
  const byName = new Map(authored.map((n) => [normalizeNpcName(n.name), n.id]))

  const ids: string[] = []
  const unknown: string[] = []

  for (const name of names) {
    const id = byName.get(normalizeNpcName(name))
    if (id) ids.push(id)
    else unknown.push(name)
  }

  return { ids: [...new Set(ids)], unknown }
}

/**
 * Appends to an append-only set. Used for metNpcIds and visitedLocationSlugs:
 * the world remembers, it does not forget.
 *
 * Returns null when nothing new arrived, so the caller can skip the UPDATE
 * entirely rather than rewrite an identical row on every single turn — and most
 * turns meet nobody new.
 */
export function mergeUnique<T>(existing: T[], incoming: T[]): T[] | null {
  const set = new Set(existing)
  const before = set.size
  for (const item of incoming) set.add(item)
  return set.size === before ? null : [...set]
}

import { z } from 'zod'

/**
 * The model returns a full state snapshot after the separator. Two failure
 * modes matter here, and they are not the same thing:
 *
 *   1. Malformed JSON — a stream cut mid-object. JSON.parse throws, and the
 *      caller's catch handles it.
 *   2. Well-formed JSON with the wrong shape — "inventory" as a string, hp as
 *      text, a hallucinated sceneTag. JSON.parse is perfectly happy; the damage
 *      only surfaces later, in the UI or in the database.
 *
 * This module covers (2). Rather than rejecting the whole snapshot — which
 * would cost the player the entire turn, including XP, for one bad field —
 * each field is validated on its own and falls back to its previous value when
 * it fails. One fumbled field degrades to "nothing changed there", not "the
 * turn never happened".
 *
 * Validation is deliberately per-field rather than one z.object(): a single
 * object parse is all-or-nothing, and all-or-nothing is the behaviour this is
 * meant to avoid.
 */

const questSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(['active', 'completed']),
})

/** Every field the model is allowed to author. Anything else it sends is
 *  server-authoritative (xp, level, tier, capstoneUsed) and is overwritten
 *  downstream, so it is passed through untouched rather than validated here. */
const fieldSchemas = {
  hp: z.number().int(),
  maxHp: z.number().int(),
  inventory: z.array(z.string()),
  quests: z.array(questSchema),
  npcMet: z.array(z.string()),
  location: z.string().nullable(),
  // The model sends null when no ability was used — accept it and normalise to
  // undefined, so the "omit the field entirely" instruction and the null it
  // actually sends both land in the same place. Without this, every ordinary
  // turn logged a repair and drowned out the ones that matter.
  abilityUsed: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
  sceneTag: z.string().min(1),
} as const

export type SnapshotFallback = {
  hp: number
  maxHp: number
  inventory: string[]
  quests: z.infer<typeof questSchema>[]
  npcMet: string[]
  location: string | null
  abilityUsed: string | undefined
  sceneTag: string
}

/**
 * Validates the parsed JSON field by field. Returns null only when the payload
 * is not an object at all — the one case where nothing is salvageable.
 *
 * Unknown keys are preserved: the server-authoritative block downstream expects
 * xp/level/tier to survive this step on turn one, when there is no previous
 * snapshot to inherit them from.
 */
export function repairSnapshot(
  raw: unknown,
  fallback: SnapshotFallback,
  onRepair: (field: string, received: unknown) => void
): Record<string, unknown> | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
    return null
  }

  const input = raw as Record<string, unknown>
  const out: Record<string, unknown> = { ...input }

  for (const [key, schema] of Object.entries(fieldSchemas)) {
    const result = schema.safeParse(input[key])

    if (result.success) {
      out[key] = result.data
    } else {
      onRepair(key, input[key])
      out[key] = fallback[key as keyof SnapshotFallback]
    }
  }

  return out
}

/**
 * Scene tags are world-scoped, so the allowed set cannot live in the schema
 * above: a tag that is valid in Neon Warszawa is a hallucination in Tréigthe.
 * The caller passes the set built from this campaign's lore. An unknown tag
 * would resolve to a background image that isn't there, so it reverts to the
 * scene the player was already in.
 */
export function resolveSceneTag(
  tag: string,
  allowed: Set<string>,
  previous: string,
  onReject: (tag: string) => void
): string {
  if (allowed.has(tag)) return tag
  onReject(tag)
  return previous
}

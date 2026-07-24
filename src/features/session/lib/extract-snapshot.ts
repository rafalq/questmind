import { type GameSnapshot } from '@/db/schema/session'
import { anthropic } from '@/lib/ai/client'
import { AI_MODEL, MAX_TOKENS } from '@/lib/ai/config'
import { SEPARATOR } from './build-system-prompt/'
import { recoverSnapshot } from './recover-snapshot'
import { repairSnapshot, resolveSceneTag } from './snapshot-schema'

type Params = {
  full: string
  separatorIndex: number
  lastSnapshot: GameSnapshot | null
  validSceneTags: Set<string>
  sessionId: string
}

/**
 * Turns raw model output into a usable snapshot, or null.
 *
 * There are three ways to end up without one, and they are not the same
 * failure: malformed JSON, no state block at all, or well-formed JSON of the
 * wrong shape. The third used to be the dangerous one - it parses cleanly and
 * only explodes later, in the UI or in the database.
 */
export async function extractSnapshot({
  full,
  separatorIndex,
  lastSnapshot,
  validSceneTags,
  sessionId,
}: Params): Promise<GameSnapshot | null> {
  const raw =
    separatorIndex !== -1
      ? parseStateBlock(full.slice(separatorIndex + SEPARATOR.length))
      : await recoverMissingStateBlock({ full, lastSnapshot, sessionId })

  if (!raw) return null

  return repair({ raw, lastSnapshot, validSceneTags, sessionId })
}

function parseStateBlock(jsonStr: string): unknown {
  try {
    return JSON.parse(jsonStr.trim())
  } catch {
    console.error('Failed to parse game snapshot:', jsonStr.trim())
    return null
  }
}

/**
 * No separator at all: the model never emitted the state block, so this turn
 * would silently update nothing - no HP, no abilityUsed, no XP. The visible
 * symptom is prose ending mid-word; the invisible one is a turn that
 * mechanically never happened.
 *
 * Regenerating the turn would rewrite prose the player has already read, so
 * ask only for the state that prose implies. One extra call in a rare case,
 * against a turn that otherwise never counted.
 */
async function recoverMissingStateBlock({
  full,
  lastSnapshot,
  sessionId,
}: {
  full: string
  lastSnapshot: GameSnapshot | null
  sessionId: string
}): Promise<unknown> {
  console.error(
    `No separator in model output (${full.length} chars) for session ${sessionId}. Snapshot lost.`
  )
  // The tail is the evidence: it shows whether the model stopped early, or
  // emitted a separator we failed to recognise - an em-dash variant would be
  // invisible to indexOf while looking correct to a human reading the log.
  console.error('TAIL:', JSON.stringify(full.slice(-150)))

  const recovered = await recoverSnapshot({
    client: anthropic,
    model: AI_MODEL,
    maxTokens: MAX_TOKENS.turn,
    narrative: full.trim(),
    lastSnapshot,
    sessionId,
  })

  if (recovered) {
    console.error(`Snapshot recovered by follow-up call for session ${sessionId}`)
  }

  return recovered
}

/**
 * Field-by-field validation. A bad field does not cost the turn: each one
 * reverts to its previous value when it fails, so one fumbled field degrades
 * to "nothing changed there" rather than to a lost turn.
 *
 * Repairs are logged individually because a field that fails repeatedly is a
 * prompt problem, and this is the only place that is visible.
 */
function repair({
  raw,
  lastSnapshot,
  validSceneTags,
  sessionId,
}: {
  raw: unknown
  lastSnapshot: GameSnapshot | null
  validSceneTags: Set<string>
  sessionId: string
}): GameSnapshot | null {
  const repairs: string[] = []

  const repaired = repairSnapshot(
    raw,
    {
      hp: lastSnapshot?.hp ?? 0,
      maxHp: lastSnapshot?.maxHp ?? 0,
      inventory: lastSnapshot?.inventory ?? [],
      quests: lastSnapshot?.quests ?? [],
      npcMet: [],
      location: null,
      abilityUsed: undefined,
      sceneTag: lastSnapshot?.sceneTag ?? 'default',
    },
    (field, received) => {
      repairs.push(field)
      console.error(
        `Snapshot field repaired: ${field} for session ${sessionId} -`,
        JSON.stringify(received)?.slice(0, 200)
      )
    }
  )

  if (!repaired) {
    // Not an object at all - an array, a string, a number. Nothing to salvage
    // field by field, so the turn is dropped like a parse error.
    console.error(`Snapshot was not an object for session ${sessionId}`)
    return null
  }

  const snapshot = repaired as GameSnapshot

  // World-scoped, so it cannot live in the schema: a tag that is valid in Neon
  // Warszawa is a hallucination in Treigthe. An unknown tag would point the UI
  // at a background image that does not exist, so it reverts to the scene the
  // player was already in.
  snapshot.sceneTag = resolveSceneTag(
    snapshot.sceneTag,
    validSceneTags,
    lastSnapshot?.sceneTag ?? 'default',
    (tag) => console.error(`Unknown sceneTag "${tag}" for session ${sessionId}`)
  )

  if (repairs.length > 0) {
    console.error(
      `Snapshot repaired (${repairs.join(', ')}) for session ${sessionId}`
    )
  }

  return snapshot
}

import { db } from '@/db'
import { campaignCharactersTable, charactersTable } from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'
import {
  levelFromXp,
  XP_PER_TURN,
} from '@/features/character/constants/progression'
import { type getClassDef } from '@/features/character/lib/get-class-def'
import { calculateMaxHp } from '@/features/character/lib/hp'
import {
  computeTier,
  effectiveAttributes,
} from '@/features/character/lib/progression'
import { and, eq } from 'drizzle-orm'
import { type SessionContext } from './validate-session'

type ClassDef = NonNullable<ReturnType<typeof getClassDef>>

type Ability = { name: string; capstone?: boolean }

type Params = {
  snapshot: GameSnapshot
  context: SessionContext
  classDef: ClassDef | null
  activeAbilities: Ability[]
}

/**
 * Everything the server decides about a turn, applied after the model has had
 * its say.
 *
 * The dividing line matters: the model narrates, the server rules. XP is
 * awarded per turn by the server and never by the model - an LLM handing out
 * points would be untestable and trivially talked up by the player. The model
 * sees xp/level/tier because they gate which abilities it may narrate, but
 * anything it sends back for those fields is discarded here.
 */
export async function applyTurnEffects({
  snapshot,
  context,
  classDef,
  activeAbilities,
}: Params): Promise<GameSnapshot> {
  const { character, campaignCharacter, lastSnapshot, baseAttributes } = context

  // Default the mirror first: the progression block below may skip on turn one
  // (no lastSnapshot), and the capstone burn flips it to true only on spend.
  // This is the single initialisation point.
  snapshot.capstoneUsed = campaignCharacter.capstoneUsed

  if (lastSnapshot && classDef) {
    await applyProgression({
      snapshot,
      lastSnapshot,
      classDef,
      baseAttributes,
      characterId: character.id,
    })
  }

  if (snapshot.abilityUsed) {
    await applyAbilityUse({ snapshot, activeAbilities, campaignCharacter })
  }

  return snapshot
}

/** Deterministic, server-authoritative progression. */
async function applyProgression({
  snapshot,
  lastSnapshot,
  classDef,
  baseAttributes,
  characterId,
}: {
  snapshot: GameSnapshot
  lastSnapshot: GameSnapshot
  classDef: ClassDef
  baseAttributes: Parameters<typeof effectiveAttributes>[0]
  characterId: string
}): Promise<void> {
  const xp = lastSnapshot.xp + XP_PER_TURN
  const level = levelFromXp(xp)
  const attributes = effectiveAttributes(baseAttributes, classDef, level)

  snapshot.xp = xp
  snapshot.level = level
  snapshot.tier = computeTier(level, attributes[classDef.keyAttribute])
  snapshot.maxHp = calculateMaxHp(attributes.endurance)

  // characterXp is the single source of truth; level, tier and max HP are
  // always derived from it and never stored.
  await db
    .update(charactersTable)
    .set({ characterXp: xp })
    .where(eq(charactersTable.id, characterId))
}

/**
 * The model reports which ability it narrated, but has no authority over the
 * name: anything outside the character's active set is discarded, so a
 * hallucinated or out-of-tier ability cannot reach the UI. If the named
 * ability was the capstone, that same use burns it for the campaign.
 */
async function applyAbilityUse({
  snapshot,
  activeAbilities,
  campaignCharacter,
}: {
  snapshot: GameSnapshot
  activeAbilities: Ability[]
  campaignCharacter: SessionContext['campaignCharacter']
}): Promise<void> {
  const used = activeAbilities.find((a) => a.name === snapshot.abilityUsed)

  if (!used) {
    snapshot.abilityUsed = undefined
    return
  }

  if (!used.capstone) return

  // activeAbilities is already filtered, so this only fires on the FIRST use -
  // later turns do not have the capstone in the set. The capstoneUsed=false
  // guard makes the write idempotent and race-safe: two turns cannot both
  // spend it.
  await db
    .update(campaignCharactersTable)
    .set({ capstoneUsed: true })
    .where(
      and(
        eq(campaignCharactersTable.id, campaignCharacter.id),
        eq(campaignCharactersTable.capstoneUsed, false)
      )
    )

  snapshot.capstoneUsed = true
}

import { db } from '@/db'
import { charactersTable } from '@/db/schema'
import { type GameSnapshot } from '@/db/schema/session'
import { levelFromXp } from '@/features/character/constants/progression'
import { getClassDef } from '@/features/character/lib/get-class-def'
import { calculateMaxHp } from '@/features/character/lib/hp'
import {
  computeTier,
  effectiveAttributes,
} from '@/features/character/lib/progression'
import { eq } from 'drizzle-orm'

const SET_XP = /^\/set\s+xp\s+(\d+)$/i

export type DebugResult = {
  feedback: string
  snapshot: GameSnapshot
}

type Params = {
  message: string
  characterId: string
  world: string
  characterClass: string
  baseAttributes: Parameters<typeof effectiveAttributes>[0]
  lastSnapshot: GameSnapshot | null
}

/**
 * Handles `/set xp <n>`, returning null for anything else.
 *
 * Every other debug command lives in debug-commands.ts, which is a pure
 * snapshot -> snapshot module with no database access - that is what makes it
 * unit-testable, and it is worth keeping. XP cannot join it: it is stored on
 * charactersTable, not in the snapshot, so setting it is a write. This module
 * exists to hold that one exception rather than either compromising
 * debug-commands.ts or leaving 60 lines of it in a route handler.
 *
 * The caller is responsible for gating this behind isDebugEnabled(); nothing
 * here checks the environment.
 *
 * characterXp is the single source of truth. Level, tier and max HP are always
 * derived from it and never stored, so the returned snapshot recomputes all
 * three rather than accepting them as input.
 */
export async function applyXpCommand({
  message,
  characterId,
  world,
  characterClass,
  baseAttributes,
  lastSnapshot,
}: Params): Promise<DebugResult | null> {
  const match = message.trim().match(SET_XP)
  if (!match || !lastSnapshot) return null

  const classDef = getClassDef(world, characterClass)
  if (!classDef) return null

  const xp = Number(match[1])
  const level = levelFromXp(xp)
  const attributes = effectiveAttributes(baseAttributes, classDef, level)
  const tier = computeTier(level, attributes[classDef.keyAttribute])

  await db
    .update(charactersTable)
    .set({ characterXp: xp })
    .where(eq(charactersTable.id, characterId))

  return {
    feedback: `[debug] xp set to ${xp} (level ${level}, tier ${tier})`,
    snapshot: {
      ...lastSnapshot,
      xp,
      level,
      tier,
      maxHp: calculateMaxHp(attributes.endurance),
    },
  }
}

// src/db/schema/lore/enums.ts
// Shared enums for the lore schema.

import { pgEnum } from 'drizzle-orm/pg-core'

export const locationTypeEnum = pgEnum('location_type', [
  'city',
  'wilderness',
  'ruin',
  'dungeon',
  'landmark',
])

export const npcRoleEnum = pgEnum('npc_role', [
  'faction_leader',
  'npc_major',
  'npc_minor',
  'hidden',
])

export const loreAccessTierEnum = pgEnum('lore_access_tier', [
  'tier_0', // Everyone knows
  'tier_1', // Race-gated
  'tier_2', // Class-gated
  'tier_3', // Backstory-gated
  'tier_secret', // AI only — never revealed directly
])

export const eventTypeEnum = pgEnum('event_type', [
  'historical', // Past event in calendar
  'current', // Happening now (Year 500)
  'future_arc', // Possible future (post-501, branching)
])

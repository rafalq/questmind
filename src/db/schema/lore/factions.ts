// src/db/schema/lore/factions.ts
// Factions and NPC membership.

import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { worldsTable } from './worlds'
import { npcCharactersTable } from './npcs'

// ── Factions ───────────────────────────────────────────────────────────────

export const factionsTable = pgTable('factions', {
  id: uuid('id').primaryKey().defaultRandom(),
  worldId: uuid('world_id')
    .notNull()
    .references(() => worldsTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  // e.g. "Church of the Last Breath", "Awakeners", "Guild Council"
  description: text('description').notNull(),
  publicGoals: text('public_goals'),
  hiddenGoals: text('hidden_goals'),
  // TIER SECRET — what the faction actually wants.
  promptContext: text('prompt_context').notNull(),
  // Injected when player interacts with faction members.
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const factionsRelations = relations(factionsTable, ({ one, many }) => ({
  world: one(worldsTable, {
    fields: [factionsTable.worldId],
    references: [worldsTable.id],
  }),
  members: many(npcFactionMembershipTable),
}))

// ── NPC ↔ Faction membership ───────────────────────────────────────────────

export const npcFactionMembershipTable = pgTable('npc_faction_membership', {
  id: uuid('id').primaryKey().defaultRandom(),
  npcId: uuid('npc_id')
    .notNull()
    .references(() => npcCharactersTable.id, { onDelete: 'cascade' }),
  factionId: uuid('faction_id')
    .notNull()
    .references(() => factionsTable.id, { onDelete: 'cascade' }),
  rank: text('rank'),
  // "High Archbishop", "Member", "Covert Operative"
  isPublic: boolean('is_public').default(true).notNull(),
  // false = membership is TIER SECRET
})

export const npcFactionMembershipRelations = relations(
  npcFactionMembershipTable,
  ({ one }) => ({
    npc: one(npcCharactersTable, {
      fields: [npcFactionMembershipTable.npcId],
      references: [npcCharactersTable.id],
    }),
    faction: one(factionsTable, {
      fields: [npcFactionMembershipTable.factionId],
      references: [factionsTable.id],
    }),
  })
)

// ── Types ──────────────────────────────────────────────────────────────────

export type Faction = typeof factionsTable.$inferSelect
export type NewFaction = typeof factionsTable.$inferInsert

export type NpcFactionMembership = typeof npcFactionMembershipTable.$inferSelect

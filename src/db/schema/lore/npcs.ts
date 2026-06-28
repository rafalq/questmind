// src/db/schema/lore/npcs.ts
// NPC characters and their tier-gated lore.

import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  uuid,
  jsonb,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { worldsTable } from './worlds'
import { locationsTable } from './locations'
import { npcFactionMembershipTable } from './factions'
import { npcRoleEnum, loreAccessTierEnum } from './enums'

// ── NPC Characters ─────────────────────────────────────────────────────────

export const npcCharactersTable = pgTable('npc_characters', {
  id: uuid('id').primaryKey().defaultRandom(),
  worldId: uuid('world_id')
    .notNull()
    .references(() => worldsTable.id, { onDelete: 'cascade' }),

  // Where this NPC is usually found.
  primaryLocationId: uuid('primary_location_id').references(
    () => locationsTable.id
  ),

  // Identity
  name: text('name').notNull(), // "Ciarán Mór"
  title: text('title'), // "High Archbishop"
  role: npcRoleEnum('role').notNull(),
  race: text('race').notNull(), // matches your race enum values
  age: integer('age'),
  ageNote: text('age_note'), // "appears 28, actual age unknown"

  // Core fields — always injected when NPC is active in a scene.
  appearance: text('appearance').notNull(),
  personality: text('personality').notNull(),
  motivation: text('motivation').notNull(),

  // TIER SECRET — AI knows, never states directly.
  // Injected into system prompt with explicit suppression instruction.
  secret: text('secret'),

  // Flexible relationship map. Avoids a join table for now.
  // { "Máthair Liath": "former student, complicated history", ... }
  relationships: jsonb('relationships'),

  // Compact version (~200 tokens) for prompt injection.
  // Full fields above used for admin/seed display.
  promptContext: text('prompt_context').notNull(),

  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const npcCharactersRelations = relations(
  npcCharactersTable,
  ({ one, many }) => ({
    world: one(worldsTable, {
      fields: [npcCharactersTable.worldId],
      references: [worldsTable.id],
    }),
    primaryLocation: one(locationsTable, {
      fields: [npcCharactersTable.primaryLocationId],
      references: [locationsTable.id],
    }),
    lore: many(npcLoreTable),
    factionMemberships: many(npcFactionMembershipTable),
  })
)

// ── NPC Lore Tiers ─────────────────────────────────────────────────────────
// What different races/classes know about an NPC.

export const npcLoreTable = pgTable('npc_lore', {
  id: uuid('id').primaryKey().defaultRandom(),
  npcId: uuid('npc_id')
    .notNull()
    .references(() => npcCharactersTable.id, { onDelete: 'cascade' }),
  tier: loreAccessTierEnum('tier').notNull(),
  applicableRaces: text('applicable_races').array(),
  applicableClasses: text('applicable_classes').array(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const npcLoreRelations = relations(npcLoreTable, ({ one }) => ({
  npc: one(npcCharactersTable, {
    fields: [npcLoreTable.npcId],
    references: [npcCharactersTable.id],
  }),
}))

// ── Types ──────────────────────────────────────────────────────────────────

export type NpcCharacter = typeof npcCharactersTable.$inferSelect
export type NewNpcCharacter = typeof npcCharactersTable.$inferInsert

export type NpcLore = typeof npcLoreTable.$inferSelect
export type NewNpcLore = typeof npcLoreTable.$inferInsert

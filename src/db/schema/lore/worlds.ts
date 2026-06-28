// src/db/schema/lore/worlds.ts
// World and region tables.
// One row per setting (Tréigthe, The Drift, Neon Warszawa 2087).

import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { worldEventsTable } from './events'
import { factionsTable } from './factions'
import { npcCharactersTable } from './npcs'
import { regionsTable } from './regions'

// Reuse your existing campaignsTable genreEnum in practice.
// Defined here for the lore schema's self-containment.
import { genreEnum } from '../enums'

export const worldsTable = pgTable('worlds', {
  id: uuid('id').primaryKey().defaultRandom(),
  genre: genreEnum('genre').notNull().unique(),
  name: text('name').notNull(), // "Tréigthe"
  subtitle: text('subtitle'), // "The Forsaken"
  systemPromptCore: text('system_prompt_core').notNull(),
  // ~500 tokens always injected into every session prompt.
  // Covers: world tone, echo rules, key secrets summary (AI-only),
  // what makes this world different from generic fantasy.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const worldsRelations = relations(worldsTable, ({ many }) => ({
  regions: many(regionsTable),
  npcs: many(npcCharactersTable),
  events: many(worldEventsTable),
  factions: many(factionsTable),
}))

// ── Types ──────────────────────────────────────────────────────────────────

export type World = typeof worldsTable.$inferSelect
export type NewWorld = typeof worldsTable.$inferInsert

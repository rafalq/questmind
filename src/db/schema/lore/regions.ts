// src/db/schema/lore/regions.ts
// Regions within a world (e.g. Talamh Liath within Tréigthe).

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { worldsTable } from './worlds'
import { locationsTable } from './locations'

export const regionsTable = pgTable('regions', {
  id: uuid('id').primaryKey().defaultRandom(),
  worldId: uuid('world_id')
    .notNull()
    .references(() => worldsTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // "Talamh Liath"
  nameTranslation: text('name_translation'), // "The Grey Land"
  description: text('description').notNull(),
  mapImagePath: text('map_image_path'), // "/public/maps/talamh-liath.jpg"
  promptContext: text('prompt_context').notNull(),
  // ~200 tokens of geographic context:
  // borders, climate, general atmosphere, key facts.
  // Injected when player is travelling between locations.
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const regionsRelations = relations(regionsTable, ({ one, many }) => ({
  world: one(worldsTable, {
    fields: [regionsTable.worldId],
    references: [worldsTable.id],
  }),
  locations: many(locationsTable),
}))

// ── Types ──────────────────────────────────────────────────────────────────

export type Region = typeof regionsTable.$inferSelect
export type NewRegion = typeof regionsTable.$inferInsert

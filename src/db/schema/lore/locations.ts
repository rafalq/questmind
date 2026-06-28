// src/db/schema/lore/locations.ts
// Named places within a region + their sub-locations and tier lore.

import { pgTable, text, boolean, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { regionsTable } from './regions'
import { npcCharactersTable } from './npcs'
import { worldEventsTable } from './events'
import { locationTypeEnum, loreAccessTierEnum } from './enums'

// ── Locations ──────────────────────────────────────────────────────────────

export const locationsTable = pgTable('locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  regionId: uuid('region_id')
    .notNull()
    .references(() => regionsTable.id, { onDelete: 'cascade' }),

  // Identity
  name: text('name').notNull(), // "Cathair Luaith"
  nameTranslation: text('name_translation'), // "Ash City"
  slug: text('slug').notNull().unique(), // "cathair-luaith"
  locationType: locationTypeEnum('location_type').notNull(),

  // scene_tag maps to AI JSON delta output and picks the right
  // image from /public/scenes/ in the UI.
  sceneTag: text('scene_tag').notNull(), // "city_square"

  // AI context — injected when player is in this location (~300 tokens).
  // Covers: atmosphere, key sub-locations, what a visitor notices first.
  promptContext: text('prompt_context').notNull(),

  // Injected separately only when the AI needs historical background.
  history: text('history'),

  // Injected when relevant to the current session.
  currentEvents: text('current_events'),

  // false = not yet reachable (future expansion packs).
  isActive: boolean('is_active').default(true).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const locationsRelations = relations(
  locationsTable,
  ({ one, many }) => ({
    region: one(regionsTable, {
      fields: [locationsTable.regionId],
      references: [regionsTable.id],
    }),
    subLocations: many(subLocationsTable),
    npcs: many(npcCharactersTable),
    events: many(worldEventsTable),
  })
)

// ── Sub-locations ──────────────────────────────────────────────────────────
// Named places within a location (e.g. Cathedral within Cathair Luaith).
// Injected only when the player explicitly visits this spot.

export const subLocationsTable = pgTable('sub_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  locationId: uuid('location_id')
    .notNull()
    .references(() => locationsTable.id, { onDelete: 'cascade' }),
  name: text('name').notNull(), // "Ardeaglais an Anáil Dheireanaigh"
  nameTranslation: text('name_translation'), // "Cathedral of the Last Breath"
  description: text('description').notNull(),
  atmosphere: text('atmosphere'),
  promptContext: text('prompt_context').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const subLocationsRelations = relations(
  subLocationsTable,
  ({ one, many }) => ({
    location: one(locationsTable, {
      fields: [subLocationsTable.locationId],
      references: [locationsTable.id],
    }),
    lore: many(subLocationLoreTable),
  })
)

// ── Sub-location lore tiers ────────────────────────────────────────────────
// What specific races/classes know about a sub-location.
// null arrays = applies to all races or all classes at this tier.

export const subLocationLoreTable = pgTable('sub_location_lore', {
  id: uuid('id').primaryKey().defaultRandom(),
  subLocationId: uuid('sub_location_id')
    .notNull()
    .references(() => subLocationsTable.id, { onDelete: 'cascade' }),
  tier: loreAccessTierEnum('tier').notNull(),
  applicableRaces: text('applicable_races').array(),
  // e.g. ["duskborn", "stonewarden"] — null = all races
  applicableClasses: text('applicable_classes').array(),
  // e.g. ["ashwalker"] — null = all classes
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const subLocationLoreRelations = relations(
  subLocationLoreTable,
  ({ one }) => ({
    subLocation: one(subLocationsTable, {
      fields: [subLocationLoreTable.subLocationId],
      references: [subLocationsTable.id],
    }),
  })
)

// ── Types ──────────────────────────────────────────────────────────────────

export type Location = typeof locationsTable.$inferSelect
export type NewLocation = typeof locationsTable.$inferInsert

export type SubLocation = typeof subLocationsTable.$inferSelect
export type NewSubLocation = typeof subLocationsTable.$inferInsert

export type SubLocationLore = typeof subLocationLoreTable.$inferSelect
export type NewSubLocationLore = typeof subLocationLoreTable.$inferInsert

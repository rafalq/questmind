// src/db/schema/lore/events.ts
// Historical calendar events, current events, and future arc branches.

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
import { eventTypeEnum } from './enums'

export const worldEventsTable = pgTable('world_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  worldId: uuid('world_id')
    .notNull()
    .references(() => worldsTable.id, { onDelete: 'cascade' }),

  // Optionally scoped to a specific location.
  locationId: uuid('location_id').references(() => locationsTable.id),

  // null = unknown/pre-calendar
  // negative = pre-Year-0 (e.g. -500 = 500 years before gods died)
  year: integer('year'),

  // Override display: "Pre-Year 0", "Year 0", "Year 500 (Present)"
  yearLabel: text('year_label'),

  eventType: eventTypeEnum('event_type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),

  // For future_arc events: what player action or condition triggers this branch.
  // e.g. { "condition": "release_condition_fulfilled", "outcome": "controlled_release" }
  branchConditions: jsonb('branch_conditions'),

  // true = always injected into system prompt (key events only, cap at ~8).
  // false = available for query but not auto-injected.
  includeInPrompt: boolean('include_in_prompt').default(false).notNull(),

  // true = AI knows but never reveals directly.
  isTierSecret: boolean('is_tier_secret').default(false).notNull(),

  // Controls ordering within same year or pre-calendar events.
  sortOrder: integer('sort_order').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const worldEventsRelations = relations(worldEventsTable, ({ one }) => ({
  world: one(worldsTable, {
    fields: [worldEventsTable.worldId],
    references: [worldsTable.id],
  }),
  location: one(locationsTable, {
    fields: [worldEventsTable.locationId],
    references: [locationsTable.id],
  }),
}))

// ── Types ──────────────────────────────────────────────────────────────────

export type WorldEvent = typeof worldEventsTable.$inferSelect
export type NewWorldEvent = typeof worldEventsTable.$inferInsert

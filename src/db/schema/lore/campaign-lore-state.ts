// src/db/schema/lore/campaign-lore-state.ts
// Per-campaign tracking of what the player has discovered.
// Links to your existing campaignsTable via campaignId.

import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { subLocationsTable } from './locations'

export const campaignLoreStateTable = pgTable('campaign_lore_state', {
  id: uuid('id').primaryKey().defaultRandom(),

  // References your existing campaignsTable.id.
  // Not declared as a foreign key here to avoid circular schema deps —
  // add the reference in your main schema index if needed.
  campaignId: uuid('campaign_id').notNull().unique(),

  // Locations the player has visited (location slugs).
  visitedLocationSlugs: text('visited_location_slugs')
    .array()
    .default([])
    .notNull(),

  // NPCs the player has met (npc_characters.id[]).
  metNpcIds: uuid('met_npc_ids').array().default([]).notNull(),

  // Lore pieces the player has explicitly discovered
  // (sub_location_lore.id[] and npc_lore.id[] that have been revealed).
  discoveredLoreIds: uuid('discovered_lore_ids').array().default([]).notNull(),

  // Current location slug — used to pull scene context for each request.
  currentLocationSlug: text('current_location_slug'),

  // Current sub-location (if player is in a specific named spot).
  currentSubLocationId: uuid('current_sub_location_id').references(
    () => subLocationsTable.id
  ),

  // NPCs present in the current scene (npc_characters.id[]).
  activeNpcIds: uuid('active_npc_ids').array().default([]).notNull(),

  // Tier secret hints the AI has already dropped.
  // Prevents the AI from repeating the same hint.
  // Stored as short descriptive strings, e.g. "ciaran-founded-awakeners-hint".
  droppedSecretHints: text('dropped_secret_hints')
    .array()
    .default([])
    .notNull(),

  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const campaignLoreStateRelations = relations(
  campaignLoreStateTable,
  ({ one }) => ({
    currentSubLocation: one(subLocationsTable, {
      fields: [campaignLoreStateTable.currentSubLocationId],
      references: [subLocationsTable.id],
    }),
  })
)

// ── Types ──────────────────────────────────────────────────────────────────

export type CampaignLoreState = typeof campaignLoreStateTable.$inferSelect
export type NewCampaignLoreState = typeof campaignLoreStateTable.$inferInsert

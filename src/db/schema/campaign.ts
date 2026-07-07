// src/db/schema/campaign.ts

import { relations } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { campaignCharactersTable } from './character'
import { genreEnum } from './enums'

export const campaignsTable = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  language: text('language').notNull().default('en'),
  name: text('name').notNull(),
  // User-defined save name — not a narrative title.
  // e.g. "Tuesday night", "The dark path"
  genre: genreEnum('genre').notNull(),
  description: text('description'),
  // Not shown to the user — populated automatically by the AI
  // after the first session as a short summary of what happened.
  // Used on the dashboard as "last session recap".
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastPlayedAt: timestamp('last_played_at'),
})

export const campaignsRelations = relations(campaignsTable, ({ many }) => ({
  campaignCharacters: many(campaignCharactersTable),
}))

export type Campaign = typeof campaignsTable.$inferSelect
export type NewCampaign = typeof campaignsTable.$inferInsert

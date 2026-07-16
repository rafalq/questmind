import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core'
import { genreEnum } from './enums'
import { campaignsTable } from './campaign'
import { relations } from 'drizzle-orm'

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────
// race, character_class → moved to plain `text`, validated in Zod against
// per-world config (features/character/config/*), since each world now
// has its own evolving roster and pgEnum migrations were getting costly.

export const attributeEnum = pgEnum('attribute', [
  'strength',
  'mind',
  'endurance',
  'agility',
  'charisma',
  'perception',
])

export const campaignCharacterStatusEnum = pgEnum('campaign_character_status', [
  'active',
  'completed',
  'dead',
])

// ─────────────────────────────────────────
// TABLES
// ─────────────────────────────────────────

export const charactersTable = pgTable('characters', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  genre: genreEnum('genre').notNull(),
  world: text('world').notNull(), // e.g. 'treigthe', 'drift', 'neon_warszawa'
  race: text('race').notNull(), // validated against RACE_OPTIONS[world] in Zod
  characterClass: text('character_class').notNull(), // validated against RACE_CLASS_OPTIONS[world][race]
  gender: text('gender'), // nullable — some races (e.g. demigod) skip this step entirely
  avatarUrl: text('avatar_url'),
  level: integer('level').default(1).notNull(),
  characterXp: integer('character_xp').default(0).notNull(),
  isAlive: boolean('is_alive').default(true).notNull(),
  inventory: jsonb('inventory').$type<string[]>().default([]).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const characterAttributesTable = pgTable('character_attributes', {
  id: uuid('id').defaultRandom().primaryKey(),
  characterId: uuid('character_id')
    .notNull()
    .references(() => charactersTable.id, { onDelete: 'cascade' }),
  attribute: attributeEnum('attribute').notNull(),
  baseValue: integer('base_value').notNull(),
  currentXp: integer('current_xp').default(0).notNull(),
  bonus: integer('bonus').default(0).notNull(),
})

export const campaignCharactersTable = pgTable(
  'campaign_characters',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    campaignId: uuid('campaign_id').references(() => campaignsTable.id, {
      onDelete: 'set null',
    }),
    characterId: uuid('character_id')
      .notNull()
      .references(() => charactersTable.id, { onDelete: 'cascade' }),
    currentHp: integer('current_hp').notNull(),
    maxHp: integer('max_hp').notNull(),
    status: campaignCharacterStatusEnum('status').default('active').notNull(),
    capstoneUsed: boolean('capstone_used').default(false).notNull(),
    joinedAt: timestamp('joined_at').defaultNow().notNull(),
  },
  (table) => [
    unique('campaign_characters_campaign_id_character_id_unique').on(
      table.campaignId,
      table.characterId
    ),
  ]
)
// ─────────────────────────────────────────
// RELATIONS
// ─────────────────────────────────────────

export const charactersRelations = relations(charactersTable, ({ many }) => ({
  campaignCharacters: many(campaignCharactersTable),
}))

export const campaignCharactersRelations = relations(
  campaignCharactersTable,
  ({ one }) => ({
    character: one(charactersTable, {
      fields: [campaignCharactersTable.characterId],
      references: [charactersTable.id],
    }),
    campaign: one(campaignsTable, {
      fields: [campaignCharactersTable.campaignId],
      references: [campaignsTable.id],
    }),
  })
)

// ─────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────

export type Character = typeof charactersTable.$inferSelect
export type NewCharacter = typeof charactersTable.$inferInsert
export type CampaignCharacter = typeof campaignCharactersTable.$inferSelect

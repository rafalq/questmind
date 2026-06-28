import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core'
import { genreEnum } from './enums'
import { campaignsTable } from './campaign'
import { relations } from 'drizzle-orm'

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

export const raceEnum = pgEnum('race', [
  // Fantasy — Tréigthe
  'scarred',
  'duskborn',
  'stonewarden',
  'bloodmarked',
  // Sci-fi — The Drift
  'drifter',
  'unshackled',
  'remnant',
  'spliced',
  // Cyberpunk — Neon Warszawa 2087
  'zelazny',
  'sieciowy',
  'kopia',
  'naturalny',
])

export const classEnum = pgEnum('character_class', [
  // Fantasy — Tréigthe
  'graveblade',
  'bleeder',
  'ashwalker',
  'last_breath_priest',
  // Sci-fi — The Drift
  'rig_runner',
  'patcher',
  'breacher',
  'ghost',
  'fixer',
  // Cyberpunk — Neon Warszawa 2087
  'posrednik',
  'wlamywacz',
  'ostrze',
  'mechanik',
  'cien',
])

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
  race: raceEnum('race').notNull(),
  characterClass: classEnum('character_class').notNull(),
  backgroundStory: text('background_story'),
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

export const campaignCharactersTable = pgTable('campaign_characters', {
  id: uuid('id').defaultRandom().primaryKey(),
  campaignId: uuid('campaign_id').references(() => campaignsTable.id, {
    onDelete: 'set null',
  }),
  // nullable — when campaign is deleted, record remains but campaignId → null
  characterId: uuid('character_id')
    .notNull()
    .references(() => charactersTable.id, { onDelete: 'cascade' }),
  currentHp: integer('current_hp').notNull(),
  maxHp: integer('max_hp').notNull(),
  // Calculated on creation: BASE_HP + (endurance * HP_PER_ENDURANCE)
  // Updated when character's endurance attribute changes
  status: campaignCharacterStatusEnum('status').default('active').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
})

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

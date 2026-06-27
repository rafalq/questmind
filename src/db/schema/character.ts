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
import { genreEnum } from './campaign'

export const raceEnum = pgEnum('race', [
  // fantasy
  'human',
  'elf',
  'dwarf',
  'orc',
  'halfling',
  // sci-fi
  'synth',
  'alien',
  'augmented',
  // cyberpunk
  'chromed',
  'netrunner_born',
  'clone',
])

export const classEnum = pgEnum('character_class', [
  // fantasy
  'warrior',
  'mage',
  'rogue',
  'cleric',
  'ranger',
  // sci-fi
  'pilot',
  'engineer',
  'soldier',
  'hacker',
  'diplomat',
  // cyberpunk
  'fixer',
  'netrunner',
  'street_samurai',
  'techie',
  'ghost',
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
  campaignId: uuid('campaign_id').notNull(),
  characterId: uuid('character_id')
    .notNull()
    .references(() => charactersTable.id, { onDelete: 'cascade' }),
  currentHp: integer('current_hp').notNull(),
  status: campaignCharacterStatusEnum('status').default('active').notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
})

import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  jsonb,
} from 'drizzle-orm/pg-core'
import { campaignsTable } from './campaign'
import { charactersTable } from './character'

export const sessionStatusEnum = pgEnum('session_status', [
  'active',
  'completed',
  'abandoned',
])

export const roleEnum = pgEnum('message_role', ['user', 'assistant'])

export type Tier = 1 | 2 | 3

export type GameSnapshot = {
  hp: number
  maxHp: number
  inventory: string[]
  quests: { id: string; title: string; status: 'active' | 'completed' }[]
  sceneTag: string

  // ── Progression: SERVER-AUTHORITATIVE ──────────────────────────────────
  // Derived from charactersTable.characterXp, never from the model's reply.
  // The model receives these (they gate which abilities it may narrate) but
  // must never set them: overwrite on every snapshot write, or a player can
  // simply ask the GM for tier 3.
  // level = levelFromXp(xp); tier = computeTier(level, keyAttributeValue)
  xp: number
  level: number
  tier: Tier

  // ── Dynamic RAG hooks (populated by the model, consumed in later steps) ──
  // npcMet:   NPC names met for the first time this turn → appended to
  //           campaignLoreState.metNpcIds for cross-campaign continuity.
  // location: new location slug if the player moved this turn, else null →
  //           updates campaignLoreState.currentLocationSlug + scene image.
  npcMet?: string[]
  location?: string | null
}

export const sessionsTable = pgTable('sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  campaignId: uuid('campaign_id')
    .notNull()
    .references(() => campaignsTable.id, { onDelete: 'cascade' }),
  characterId: uuid('character_id')
    .notNull()
    .references(() => charactersTable.id, { onDelete: 'cascade' }),
  status: sessionStatusEnum('status').default('active').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const messagesTable = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  sessionId: uuid('session_id')
    .notNull()
    .references(() => sessionsTable.id, { onDelete: 'cascade' }),
  role: roleEnum('role').notNull(),
  content: text('content').notNull(),
  snapshot: jsonb('snapshot').$type<GameSnapshot>(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

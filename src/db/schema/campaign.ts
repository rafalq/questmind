import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const genreEnum = pgEnum('genre', ['fantasy', 'sci-fi', 'cyberpunk'])

export const campaignsTable = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull(),
  name: text('name').notNull(),
  genre: genreEnum('genre').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  lastPlayedAt: timestamp('last_played_at'),
})

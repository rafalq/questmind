// src/db/schema/enums.ts
import { pgEnum } from 'drizzle-orm/pg-core'

export const genreEnum = pgEnum('genre', ['fantasy', 'sci-fi', 'cyberpunk'])

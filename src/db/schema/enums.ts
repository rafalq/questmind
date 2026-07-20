import { pgEnum } from 'drizzle-orm/pg-core'
import { GENRES } from '@/worlds/schema/primitives'

export const genreEnum = pgEnum('genre', GENRES)

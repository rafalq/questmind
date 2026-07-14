// GENRES/GenreSchema/Genre
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Genres — must match Genre in shared.ts exactly (stored in DB `genre`)
// ---------------------------------------------------------------------------

export const GENRES = ['fantasy', 'sci-fi', 'cyberpunk'] as const
export const GenreSchema = z.enum(GENRES)
export type Genre = z.infer<typeof GenreSchema>

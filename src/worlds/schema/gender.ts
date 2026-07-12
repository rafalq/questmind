import { z } from 'zod'
import { ModifiersSchema } from '../schema/'

// ---------------------------------------------------------------------------
// Genders — shape of GenderOption from gender.ts
// ---------------------------------------------------------------------------

export const GENDERS = ['male', 'female'] as const
export const GenderSchema = z.enum(GENDERS)
export type Gender = z.infer<typeof GenderSchema>

/**
 * Ids are constrained to male/female (not free-form strings) because the
 * portrait filename convention `{race}-{gender}-{class}.jpg` depends on them.
 */
export const GenderOptionSchema = z.object({
  id: GenderSchema,
  label: z.string().min(1),
  statModifiers: ModifiersSchema,
})

export type GenderOption = z.infer<typeof GenderOptionSchema>

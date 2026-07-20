import { z } from 'zod'
import { ModifiersSchema } from './attribute'
import { StartingItemSchema } from './item'

// ---------------------------------------------------------------------------
// Races — shape of RaceDefinition from shared.ts
// ---------------------------------------------------------------------------

export const RaceDefinitionSchema = z
  .object({
    /** Stable id stored in the DB `race` column (plain text). */
    value: z.string().min(1),
    label: z.string().min(1),
    description: z.string().min(1),
    modifiers: ModifiersSchema,
    startingEquipment: z.array(StartingItemSchema).default([]),
    /** When true, the Sex step is skipped and portraitUrl is used. */
    genderless: z.boolean().default(false),
    /** Required when genderless is true. */
    portraitUrl: z.string().min(1).optional(),
    /** Required when genderless is false. */
    femalePortraitUrl: z.string().min(1).optional(),
    malePortraitUrl: z.string().min(1).optional(),
  })
  .superRefine((race, ctx) => {
    if (race.genderless) {
      if (!race.portraitUrl) {
        ctx.addIssue({
          code: 'custom', // zod 4: raw literal instead of deprecated ZodIssueCode
          message: `Genderless race "${race.value}" needs portraitUrl`,
        })
      }
    } else if (!race.femalePortraitUrl || !race.malePortraitUrl) {
      ctx.addIssue({
        code: 'custom',
        message: `Race "${race.value}" needs femalePortraitUrl and malePortraitUrl`,
      })
    }
  })

export type RaceDefinition = z.infer<typeof RaceDefinitionSchema>

// src/worlds/schema/ability.ts
import { z } from 'zod'

export const TierSchema = z.union([z.literal(1), z.literal(2), z.literal(3)])

export const AbilityCostSchema = z.discriminatedUnion('kind', [
  // Mechanical: the GM must reflect this in the snapshot (HP is tracked state).
  z.object({ kind: z.literal('hp'), amount: z.number().int().positive() }),
  // Narrative: the GM invents and enforces the price in prose. Not tracked.
  z.object({ kind: z.literal('narrative'), note: z.string().min(1) }),
])

export const AbilityDefinitionSchema = z.object({
  value: z.string().min(1), // slug — never shown to the player
  name: z.string().min(1), // display label (UI + prompt)
  tier: TierSchema,
  description: z.string().min(1), // player-facing, flavourful
  gmGuidance: z.string().min(1), // model-facing, ONE sentence — token budget
  cost: AbilityCostSchema.optional(),
  // If set, this ability replaces that slug once unlocked (evolve / scale).
  evolvesFrom: z.string().optional(),
})

export type AbilityDefinitionInput = z.input<typeof AbilityDefinitionSchema>
export type AbilityDefinition = z.output<typeof AbilityDefinitionSchema>

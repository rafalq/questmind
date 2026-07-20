// ---------------------------------------------------------------------------
// Classes — shape of ClassDefinition from shared.ts
// ---------------------------------------------------------------------------

import z from 'zod'
import { ModifiersSchema } from './attribute'
import { StartingItemSchema } from './item'
// src/worlds/schema/class.ts  — dodaj do istniejącego ClassDefinitionSchema
import { AbilityDefinitionSchema } from './ability'

const AttributeKeySchema = z.enum([
  'strength',
  'mind',
  'endurance',
  'agility',
  'charisma',
  'perception',
])

/** Attribute points auto-allocated on each level-up. Never subtracts. */
const GrowthSchema = z.object({
  primary: AttributeKeySchema,
  secondary: AttributeKeySchema,
})

/**
 * Note: class icons intentionally live OUTSIDE world definitions
 * (per-world maps like TREIGTHE_CLASS_ICONS stay where they are).
 * Definitions remain pure serializable data; icons are presentation.
 */
export const ClassDefinitionSchema = z.object({
  /** Stable id stored in the DB `characterClass` column (underscores kept). */
  value: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  modifiers: ModifiersSchema,
  startingEquipment: z.array(StartingItemSchema).default([]),
  keyAttribute: AttributeKeySchema, // gates tier progression
  growth: GrowthSchema,
  abilities: z.array(AbilityDefinitionSchema),
})

export type ClassDefinition = z.infer<typeof ClassDefinitionSchema>

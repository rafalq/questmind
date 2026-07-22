import { z } from 'zod'

// ---------------------------------------------------------------------------
// Attributes
// ---------------------------------------------------------------------------

export const ATTRIBUTES = [
  'strength',
  'mind',
  'endurance',
  'agility',
  'charisma',
  'perception',
] as const

export type Attribute = (typeof ATTRIBUTES)[number]

/** Partial attribute modifiers, e.g. { strength: 1, endurance: -1 }. */
export const ModifiersSchema = z.object({
  strength: z.number().int().optional(),
  mind: z.number().int().optional(),
  endurance: z.number().int().optional(),
  agility: z.number().int().optional(),
  charisma: z.number().int().optional(),
  perception: z.number().int().optional(),
})

export type Modifiers = z.infer<typeof ModifiersSchema>

/** World-specific display names for the six attributes. */
export const AttributeLabelsSchema = z.object({
  strength: z.string().min(1),
  mind: z.string().min(1),
  endurance: z.string().min(1),
  agility: z.string().min(1),
  charisma: z.string().min(1),
  perception: z.string().min(1),
})

export type AttributeLabels = z.infer<typeof AttributeLabelsSchema>

/**
 * World-specific one-line explanations shown under each attribute in the
 * character wizard. Kept separate from AttributeLabelsSchema so a world can
 * be migrated to descriptions without touching its existing labels.
 *
 * Keep these to a single sentence — six multi-sentence blocks turn the
 * Attributes step into a wall of text.
 */
export const AttributeDescriptionsSchema = z.object({
  strength: z.string().min(1).max(160),
  mind: z.string().min(1).max(160),
  endurance: z.string().min(1).max(160),
  agility: z.string().min(1).max(160),
  charisma: z.string().min(1).max(160),
  perception: z.string().min(1).max(160),
})

export type AttributeDescriptions = z.infer<typeof AttributeDescriptionsSchema>

/** Attribute keys as a Zod enum — needed by keyAttribute and growth. */
export const AttributeKeySchema = z.enum(ATTRIBUTES)
export type AttributeKey = z.infer<typeof AttributeKeySchema>

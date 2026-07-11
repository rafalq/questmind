import { z } from 'zod'
import { CampaignBriefSchema } from './campaign-brief'

/**
 * World definition schema (v3) — aligned 1:1 with the existing types in
 * features/character/constants/ (shared.ts, worlds.ts, gender.ts):
 * - races/classes use value/label naming and carry attribute modifiers
 * - worlds use value + name + subtitle (StepWorld card shape)
 * - gender options with stat modifiers are part of the world definition
 *   (replaces WORLD_GENDER_OPTIONS from gender.ts)
 */

// ---------------------------------------------------------------------------
// Items — display metadata for inventory entries
// ---------------------------------------------------------------------------

export const ITEM_CATEGORIES = [
  'weapon',
  'armor',
  'consumable',
  'tool',
  'relic',
  'misc',
] as const

export const ItemCategorySchema = z.enum(ITEM_CATEGORIES)
export type ItemCategory = z.infer<typeof ItemCategorySchema>

/**
 * Display metadata for an inventory entry, keyed by the item name stored in
 * GameSnapshot.inventory. Authored per world; items the GM invents at runtime
 * (loot, /additem) simply won't be found here — the UI must fall back.
 */
export const ItemDefinitionSchema = z.object({
  description: z.string().min(1),
  category: ItemCategorySchema,
  /**
   * Carry weight in abstract slots. Unused at runtime for now — reserved for
   * the encumbrance system (see docs/future/data-model.md). Authored upfront
   * so item data doesn't need revisiting when capacity rules land.
   */
  slots: z.number().int().positive().default(1),
})

export type ItemDefinition = z.infer<typeof ItemDefinitionSchema>

// ---------------------------------------------------------------------------
// Starting equipment
// ---------------------------------------------------------------------------

export const StartingItemSchema = z.object({
  name: z.string().min(1),
  qty: z.number().int().positive(),
  slots: z.number().int().positive().default(1),
})

export type StartingItem = z.infer<typeof StartingItemSchema>

// ---------------------------------------------------------------------------
// Genres — must match Genre in shared.ts exactly (stored in DB `genre`)
// ---------------------------------------------------------------------------

export const GENRES = ['fantasy', 'sci-fi', 'cyberpunk'] as const
export const GenreSchema = z.enum(GENRES)
export type Genre = z.infer<typeof GenreSchema>

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

// ---------------------------------------------------------------------------
// Classes — shape of ClassDefinition from shared.ts
// ---------------------------------------------------------------------------

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
  abilities: z
    .array(
      z.object({
        name: z.string(), // "Blood Casting"
        description: z.string(), // short: what it does and its cost
      })
    )
    .default([]),
})

export type ClassDefinition = z.infer<typeof ClassDefinitionSchema>

// ---------------------------------------------------------------------------
// Prompt fragments
// ---------------------------------------------------------------------------

export const WorldPromptSchema = z.object({
  /** Core setting summary injected into buildSystemPrompt. */
  intro: z.string().min(1),
  /** Tone and narration rules (grimdark, noir, etc.). */
  tone: z.string().min(1),
  /** Optional language rules, e.g. Polish/English code-switching. */
  language: z.string().optional(),
})

export type WorldPrompt = z.infer<typeof WorldPromptSchema>

// ---------------------------------------------------------------------------
// Scenarios — predefined campaign briefs offered in the New Campaign form
// ---------------------------------------------------------------------------

export const ScenarioSchema = z.object({
  id: z.string().min(1),
  /** Name shown in the scenario dropdown, e.g. "The Stolen God". */
  label: z.string().min(1),
  /** Prefilled brief the player can edit before creating the campaign. */
  brief: CampaignBriefSchema,
})

export type Scenario = z.infer<typeof ScenarioSchema>

// ---------------------------------------------------------------------------
// World — extends the StepWorld card shape from worlds.ts
// ---------------------------------------------------------------------------

export const WorldDefinitionSchema = z
  .object({
    /** Stable id stored in the DB `world` column. */
    value: z.string().min(1),
    genre: GenreSchema,
    /** Card title, e.g. "Tréigthe". */
    name: z.string().min(1),
    /** Card subtitle, e.g. "The Forsaken". */
    subtitle: z.string().min(1),
    /** Shown on the world selection card. */
    description: z.string().min(1),
    /** World-specific attribute display names (ATTRIBUTE_LABELS_BY_WORLD). */
    attributeLabels: AttributeLabelsSchema,
    /** Sex options with stat modifiers (replaces WORLD_GENDER_OPTIONS). */
    genderOptions: z.array(GenderOptionSchema).min(1),
    races: z.array(RaceDefinitionSchema).min(1),
    classes: z.array(ClassDefinitionSchema).min(1),
    /**
     * Item metadata keyed by the exact name used in startingEquipment and
     * GameSnapshot.inventory. Optional: worlds without item copy still work,
     * and the UI falls back for unknown entries.
     */
    items: z.record(z.string(), ItemDefinitionSchema).default({}),
    /**
     * Base URL for class portraits following the convention
     * `{race}-{gender}-{class}.jpg` (gender segment omitted for
     * genderless races) — see buildClassPortraitUrl in the registry.
     */
    classPortraitsBaseUrl: z.string().min(1),
    /** Default starting location used in the opening scene. */
    startingLocation: z.string().optional(),
    prompt: WorldPromptSchema,
    /** Predefined scenarios for the New Campaign dropdown (optional). */
    scenarios: z.array(ScenarioSchema).default([]),
    /** Stub worlds are registered but greyed out until content is ready. */
    enabled: z.boolean().default(true),
  })
  .refine((w) => new Set(w.races.map((r) => r.value)).size === w.races.length, {
    message: 'Duplicate race values within world',
  })
  .refine(
    (w) => new Set(w.classes.map((c) => c.value)).size === w.classes.length,
    { message: 'Duplicate class values within world' }
  )

export type WorldDefinition = z.infer<typeof WorldDefinitionSchema>
/** Input shape for authoring definitions — fields with defaults are optional. */
export type WorldDefinitionInput = z.input<typeof WorldDefinitionSchema>

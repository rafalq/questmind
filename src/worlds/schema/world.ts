// ---------------------------------------------------------------------------
// World — extends the StepWorld card shape from worlds.ts
// ---------------------------------------------------------------------------

import z from 'zod'
import { AttributeLabelsSchema } from './attribute'
import { ClassDefinitionSchema } from './class'
import { GenderOptionSchema } from './gender'
import { ItemDefinitionSchema } from './item'
import { GenreSchema } from './primitives'
import { RaceDefinitionSchema } from './race'
import { ScenarioSchema } from './scenario'

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
    cardImageUrl: z.string().min(1),
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

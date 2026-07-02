// features/character/constants/gender.ts
// Sex/gender options per world. Not every race uses these — see
// RaceDefinition.genderless (e.g. demigod skips this step entirely).

import type { Attribute } from './shared'
import type { World } from './worlds'

export type GenderOption = {
  id: string
  label: string
  statModifiers: Partial<Record<Attribute, number>>
}

export const WORLD_GENDER_OPTIONS: Record<World, GenderOption[]> = {
  treigthe: [
    {
      id: 'female',
      label: 'Female',
      statModifiers: { strength: -1, charisma: 1 },
    },
    {
      id: 'male',
      label: 'Male',
      statModifiers: { strength: 1, charisma: -1 },
    },
  ],
}

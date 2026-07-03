// features/character/constants/fantasy/treigthe.ts

import {
  IconCandle,
  IconFoodsteps,
  IconSword,
  IconWand,
} from '@tabler/icons-react'
import type { Attribute, ClassDefinition, RaceDefinition } from '../shared'

// ============================================================
// TYPES
// ============================================================

export type TreigtheRace = 'scarred' | 'duskborn' | 'stonewarden' | 'demigod'

export type TreigtheClass =
  | 'graveblade'
  | 'bleeder'
  | 'ashwalker'
  | 'last_breath_priest'

// ============================================================
// ATTRIBUTE LABELS
// ============================================================

export const TREIGTHE_ATTRIBUTE_LABELS: Record<Attribute, string> = {
  strength: 'Strength',
  mind: 'Intellect',
  endurance: 'Constitution',
  agility: 'Dexterity',
  charisma: 'Presence',
  perception: 'Awareness',
}

// ============================================================
// ICONS
// ============================================================

export const TREIGTHE_CLASS_ICONS: Record<TreigtheClass, typeof IconSword> = {
  graveblade: IconSword,
  bleeder: IconWand,
  ashwalker: IconFoodsteps,
  last_breath_priest: IconCandle,
}

// ============================================================
// RACES
// ============================================================

const TREIGTHE_RACE_PORTAITS_BASE_URL =
  '/images/fantasy/treigthe/characters/races/'

export const TREIGTHE_RACES: RaceDefinition<TreigtheRace>[] = [
  {
    value: 'scarred',
    label: 'Scarred',
    description:
      "Survivors marked by the gods' fall. Adaptable, distrustful, and harder to kill than they should be.",
    modifiers: { strength: 1, endurance: 1 },
    femalePortraitUrl: `${TREIGTHE_RACE_PORTAITS_BASE_URL}scarred-female.jpg`,
    malePortraitUrl: `${TREIGTHE_RACE_PORTAITS_BASE_URL}scarred-male.jpg`,
  },
  {
    value: 'duskborn',
    label: 'Duskborn',
    description:
      'Ancient elves slowly fading from the world. They remember the living gods — and the night they died.',
    modifiers: { mind: 2, perception: 2, endurance: -1 },
    femalePortraitUrl: `${TREIGTHE_RACE_PORTAITS_BASE_URL}duskborn-female.jpg`,
    malePortraitUrl: `${TREIGTHE_RACE_PORTAITS_BASE_URL}duskborn-male.jpg`,
  },
  {
    value: 'stonewarden',
    label: 'Stonewarden',
    description:
      'Dwarf guardians of the god-tombs. Patient, secretive, and bound by duties older than memory.',
    modifiers: { endurance: 3, strength: 1, agility: -1 },
    femalePortraitUrl: `${TREIGTHE_RACE_PORTAITS_BASE_URL}stonewarden-female.jpg`,
    malePortraitUrl: `${TREIGTHE_RACE_PORTAITS_BASE_URL}stonewarden-male.jpg`,
  },
  {
    value: 'demigod',
    label: 'Fadeborn',
    description:
      'Offspring of a fading god and a mortal. Neither fully divine nor fully human — a body caught between, carrying a fraction of power it was never meant to hold. Their kind know no sex, only the slow, uneven weight of incomplete divinity.',
    modifiers: { mind: 2, perception: 2, endurance: -1 },
    genderless: true,
    portraitUrl: `${TREIGTHE_RACE_PORTAITS_BASE_URL}demigod.jpg`,
  },
]

// ============================================================
// CLASSES
// ============================================================

// features/character/constants/portraits.ts
export const TREIGTHE_CLASS_PORTAITS_BASE_URL =
  '/images/fantasy/treigthe/characters/classes/'

export const TREIGTHE_CLASSES: ClassDefinition<TreigtheClass>[] = [
  {
    value: 'graveblade',
    label: 'Graveblade',
    description:
      "Mercenary with no allegiance and no illusions. Fights for coin. Survives because others don't.",
    modifiers: { strength: 2, endurance: 2 },
  },
  {
    value: 'bleeder',
    label: 'Bleeder',
    description:
      'Echo mage who pays with their body. Every spell costs something real — blood, years, memory.',
    modifiers: { mind: 3, perception: 1, endurance: -1 },
  },
  {
    value: 'ashwalker',
    label: 'Ashwalker',
    description:
      'Smuggler, spy, shadow. Moves between worlds without being seen. Knows where the tunnels are.',
    modifiers: { agility: 3, perception: 1, strength: -1 },
  },
  {
    value: 'last_breath_priest',
    label: 'Last Breath Priest',
    description:
      "Priest of the dead gods. Does not heal — curses. The Church tolerates them. Most people don't.",
    modifiers: { charisma: 2, mind: 2, agility: -1 },
  },
]

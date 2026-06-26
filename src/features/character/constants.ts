// ============================================================
// TYPES
// ============================================================

export type Genre = 'fantasy' | 'sci-fi' | 'cyberpunk'
export type Attribute =
  | 'strength'
  | 'mind'
  | 'endurance'
  | 'agility'
  | 'charisma'
  | 'perception'
export type Race =
  | 'human'
  | 'elf'
  | 'dwarf'
  | 'orc'
  | 'halfling'
  | 'synth'
  | 'alien'
  | 'augmented'
  | 'chromed'
  | 'netrunner_born'
  | 'clone'
export type CharacterClass =
  | 'warrior'
  | 'mage'
  | 'rogue'
  | 'cleric'
  | 'ranger'
  | 'pilot'
  | 'engineer'
  | 'soldier'
  | 'hacker'
  | 'diplomat'
  | 'fixer'
  | 'netrunner'
  | 'street_samurai'
  | 'techie'
  | 'ghost'

// ============================================================
// ATTRIBUTE LABELS PER GENRE
// ============================================================

export const ATTRIBUTE_LABELS: Record<Genre, Record<Attribute, string>> = {
  fantasy: {
    strength: 'Strength',
    mind: 'Intellect',
    endurance: 'Constitution',
    agility: 'Dexterity',
    charisma: 'Presence',
    perception: 'Awareness',
  },
  'sci-fi': {
    strength: 'Brawn',
    mind: 'Logic',
    endurance: 'Resilience',
    agility: 'Reflexes',
    charisma: 'Influence',
    perception: 'Scan',
  },
  cyberpunk: {
    strength: 'Muscle',
    mind: 'Wetware',
    endurance: 'Grit',
    agility: 'Speed',
    charisma: 'Street Cred',
    perception: 'Instinct',
  },
}

// ============================================================
// RACES PER GENRE
// ============================================================

export type RaceDefinition = {
  value: Race
  label: string
  description: string
  modifiers: Partial<Record<Attribute, number>>
}

export const RACES_BY_GENRE: Record<Genre, RaceDefinition[]> = {
  fantasy: [
    {
      value: 'human',
      label: 'Human',
      description:
        'Adaptable and ambitious, humans excel in any path they choose.',
      modifiers: { strength: 1, mind: 1 },
    },
    {
      value: 'elf',
      label: 'Elf',
      description:
        'Ancient and graceful, elves possess sharp minds and keen senses.',
      modifiers: { mind: 2, perception: 2, endurance: -1 },
    },
    {
      value: 'dwarf',
      label: 'Dwarf',
      description:
        'Stout and resilient, dwarves are masters of craft and endurance.',
      modifiers: { endurance: 3, strength: 1, agility: -1 },
    },
    {
      value: 'orc',
      label: 'Orc',
      description: 'Fierce and powerful, orcs dominate through brute force.',
      modifiers: { strength: 3, endurance: 1, mind: -2 },
    },
    {
      value: 'halfling',
      label: 'Halfling',
      description:
        'Small but nimble, halflings are surprisingly lucky and quick.',
      modifiers: { agility: 3, charisma: 1, strength: -2 },
    },
  ],
  'sci-fi': [
    {
      value: 'human',
      label: 'Human',
      description:
        'Survivors of the diaspora, humans adapt to any corner of the galaxy.',
      modifiers: { strength: 1, mind: 1 },
    },
    {
      value: 'synth',
      label: 'Synth',
      description:
        'Synthetic beings with perfect recall and machine-like precision.',
      modifiers: { mind: 3, perception: 2, charisma: -2 },
    },
    {
      value: 'alien',
      label: 'Alien',
      description: 'Xenomorphic life forms with unique biology and perception.',
      modifiers: { perception: 3, agility: 1, charisma: -1 },
    },
    {
      value: 'augmented',
      label: 'Augmented',
      description: 'Humans enhanced with cybernetic implants and bio-mods.',
      modifiers: { strength: 2, endurance: 2, mind: -1 },
    },
  ],
  cyberpunk: [
    {
      value: 'human',
      label: 'Human',
      description:
        'Unmodified flesh — rare, distrusted, and dangerously unpredictable.',
      modifiers: { charisma: 2, mind: 1 },
    },
    {
      value: 'chromed',
      label: 'Chromed',
      description:
        'Heavy cyberware replaces flesh. Built for the street, not the boardroom.',
      modifiers: { strength: 3, endurance: 2, charisma: -2 },
    },
    {
      value: 'netrunner_born',
      label: 'Netrunner-Born',
      description: 'Raised jacked in. The net is their second home.',
      modifiers: { mind: 3, perception: 2, strength: -2 },
    },
    {
      value: 'clone',
      label: 'Clone',
      description:
        'Mass-produced and discarded. Fighting for an identity that was never theirs.',
      modifiers: { agility: 2, endurance: 2, charisma: -1 },
    },
  ],
}

// ============================================================
// CLASSES PER GENRE
// ============================================================

export type ClassDefinition = {
  value: CharacterClass
  label: string
  description: string
  modifiers: Partial<Record<Attribute, number>>
}

export const CLASSES_BY_GENRE: Record<Genre, ClassDefinition[]> = {
  fantasy: [
    {
      value: 'warrior',
      label: 'Warrior',
      description: 'Masters of combat, forged in the heat of battle.',
      modifiers: { strength: 2, endurance: 2 },
    },
    {
      value: 'mage',
      label: 'Mage',
      description: 'Wielders of arcane power, fragile but devastating.',
      modifiers: { mind: 3, perception: 1, endurance: -1 },
    },
    {
      value: 'rogue',
      label: 'Rogue',
      description: 'Shadows and daggers. Strike first, ask never.',
      modifiers: { agility: 3, perception: 1, strength: -1 },
    },
    {
      value: 'cleric',
      label: 'Cleric',
      description: 'Divine conduits — healers and warriors of faith.',
      modifiers: { charisma: 2, endurance: 2, agility: -1 },
    },
    {
      value: 'ranger',
      label: 'Ranger',
      description: 'Hunters of the wild, at home beyond the city walls.',
      modifiers: { perception: 3, agility: 1, charisma: -1 },
    },
  ],
  'sci-fi': [
    {
      value: 'pilot',
      label: 'Pilot',
      description: 'Born in the cockpit. At one with any ship they fly.',
      modifiers: { agility: 3, perception: 1, endurance: -1 },
    },
    {
      value: 'engineer',
      label: 'Engineer',
      description:
        'Problem solvers. Every system has a weakness — they find it.',
      modifiers: { mind: 3, endurance: 1, charisma: -1 },
    },
    {
      value: 'soldier',
      label: 'Soldier',
      description: 'Front-line fighters trained for the harshest conditions.',
      modifiers: { strength: 2, endurance: 2, mind: -1 },
    },
    {
      value: 'hacker',
      label: 'Hacker',
      description: 'The battlefield is digital. They rewrite reality.',
      modifiers: { mind: 3, perception: 2, strength: -2 },
    },
    {
      value: 'diplomat',
      label: 'Diplomat',
      description: 'Words as weapons. Conflicts end before they begin.',
      modifiers: { charisma: 3, mind: 1, strength: -1 },
    },
  ],
  cyberpunk: [
    {
      value: 'fixer',
      label: 'Fixer',
      description: 'Connects people. Knows everyone, owes no one.',
      modifiers: { charisma: 3, mind: 1, endurance: -1 },
    },
    {
      value: 'netrunner',
      label: 'Netrunner',
      description: 'Dives into the net where others fear to jack in.',
      modifiers: { mind: 3, perception: 2, strength: -2 },
    },
    {
      value: 'street_samurai',
      label: 'Street Samurai',
      description: 'Chrome and steel. Hired blades with a code.',
      modifiers: { strength: 2, agility: 2, mind: -1 },
    },
    {
      value: 'techie',
      label: 'Techie',
      description: 'Builds, breaks, and rebuilds anything with circuits.',
      modifiers: { mind: 2, endurance: 2, charisma: -1 },
    },
    {
      value: 'ghost',
      label: 'Ghost',
      description: 'Never seen. Never heard. Already gone.',
      modifiers: { agility: 3, perception: 1, strength: -1 },
    },
  ],
}

// ============================================================
// POINT BUY SYSTEM
// ============================================================

export const POINT_BUY_TOTAL = 60
export const ATTRIBUTE_MIN = 1
export const ATTRIBUTE_MAX = 15 // before racial/class modifiers
export const ATTRIBUTE_HARD_MAX = 20 // after all modifiers

// HP calculation
export const calculateMaxHp = (enduranceTotal: number): number => {
  return 10 + enduranceTotal * 2
}

// ============================================================
// HELPER: calculate total attribute value
// ============================================================

export const calculateAttributeTotal = (
  base: number,
  raceModifier: number = 0,
  classModifier: number = 0
): number => {
  return Math.min(
    ATTRIBUTE_HARD_MAX,
    Math.max(1, base + raceModifier + classModifier)
  )
}

// ============================================================
// XP THRESHOLDS
// ============================================================

export const ATTRIBUTE_XP_THRESHOLD = 100 // XP needed per attribute level up
export const CHARACTER_XP_PER_SESSION = 50 // XP awarded on campaign completion

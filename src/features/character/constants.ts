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
  // Fantasy — Tréigthe
  | 'scarred'
  | 'duskborn'
  | 'stonewarden'
  | 'bloodmarked'
  // Sci-fi — The Drift
  | 'drifter'
  | 'unshackled'
  | 'remnant'
  | 'spliced'
  // Cyberpunk — Neon Warszawa 2087
  | 'zelazny'
  | 'sieciowy'
  | 'kopia'
  | 'naturalny'

export type CharacterClass =
  // Fantasy — Tréigthe
  | 'graveblade'
  | 'bleeder'
  | 'ashwalker'
  | 'last_breath_priest'
  // Sci-fi — The Drift
  | 'rig_runner'
  | 'patcher'
  | 'breacher'
  | 'ghost'
  | 'fixer'
  // Cyberpunk — Neon Warszawa 2087
  | 'posrednik'
  | 'wlamywacz'
  | 'ostrze'
  | 'mechanik'
  | 'cien'

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
      value: 'scarred',
      label: 'Scarred',
      description:
        "Survivors marked by the gods' fall. Adaptable, distrustful, and harder to kill than they should be.",
      modifiers: { strength: 1, endurance: 1 },
    },
    {
      value: 'duskborn',
      label: 'Duskborn',
      description:
        'Ancient elves slowly fading from the world. They remember the living gods — and the night they died.',
      modifiers: { mind: 2, perception: 2, endurance: -1 },
    },
    {
      value: 'stonewarden',
      label: 'Stonewarden',
      description:
        'Dwarf guardians of the god-tombs. Patient, secretive, and bound by duties older than memory.',
      modifiers: { endurance: 3, strength: 1, agility: -1 },
    },
    {
      value: 'bloodmarked',
      label: 'Bloodmarked',
      description:
        'Orcs scarred by first contact with the echo. Their wounds glow faintly. They are feared — sometimes by themselves.',
      modifiers: { strength: 3, endurance: 1, mind: -2 },
    },
  ],
  'sci-fi': [
    {
      value: 'drifter',
      label: 'Drifter',
      description: 'Born between stations, loyal to no port. The void is home.',
      modifiers: { agility: 2, perception: 1 },
    },
    {
      value: 'unshackled',
      label: 'Unshackled',
      description:
        'Freed synthetic consciousness. Built to serve — now building something else entirely.',
      modifiers: { mind: 3, perception: 2, charisma: -2 },
    },
    {
      value: 'remnant',
      label: 'Remnant',
      description:
        'Survivor of a collapsed colony. Carries loss like armour. Does not break easily.',
      modifiers: { endurance: 3, strength: 1, mind: -1 },
    },
    {
      value: 'spliced',
      label: 'Spliced',
      description:
        'Heavily gene-modified human. Faster, stranger, and no longer entirely sure what they are.',
      modifiers: { agility: 2, strength: 2, charisma: -1 },
    },
  ],
  cyberpunk: [
    {
      value: 'zelazny',
      label: 'Iron-born',
      description:
        'Full chrome, minimal organic. The body is hardware. Pain is a patch note.',
      modifiers: { strength: 3, endurance: 2, charisma: -2 },
    },
    {
      value: 'sieciowy',
      label: 'Netborn',
      description:
        'Net-native, body almost irrelevant. Reality is lag. The grid is everything.',
      modifiers: { mind: 3, perception: 2, strength: -2 },
    },
    {
      value: 'kopia',
      label: 'Copy',
      description:
        "Clone with fragmented identity. Someone else's face, someone else's memories. Making it their own.",
      modifiers: { agility: 2, endurance: 2, charisma: -1 },
    },
    {
      value: 'naturalny',
      label: 'Natural',
      description:
        "Unmodified human — rare, distrusted, and dangerously unpredictable. The corps don't know what to do with them.",
      modifiers: { charisma: 2, mind: 2 },
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
  ],
  'sci-fi': [
    {
      value: 'rig_runner',
      label: 'Rig Runner',
      description:
        "Ship pilot and salvager. If it flies, drifts, or explodes — they've been there.",
      modifiers: { agility: 3, perception: 1, endurance: -1 },
    },
    {
      value: 'patcher',
      label: 'Patcher',
      description:
        'Field medic and tech repair. Keeps people alive long enough to make more mistakes.',
      modifiers: { mind: 2, endurance: 2, strength: -1 },
    },
    {
      value: 'breacher',
      label: 'Breacher',
      description:
        'Close-quarters combat specialist. First through the door, last to fall.',
      modifiers: { strength: 2, endurance: 2, mind: -1 },
    },
    {
      value: 'ghost',
      label: 'Ghost',
      description:
        "Stealth operative with no records. Was never here. Can't be found. Already gone.",
      modifiers: { agility: 3, perception: 2, strength: -2 },
    },
    {
      value: 'fixer',
      label: 'Fixer',
      description:
        'Negotiator, deal-maker, information broker. Knows everyone. Owes no one.',
      modifiers: { charisma: 3, mind: 1, endurance: -1 },
    },
  ],
  cyberpunk: [
    {
      value: 'posrednik',
      label: 'Broker',
      description:
        'Intermediary between corps and street. Speaks both languages. Trusted by neither.',
      modifiers: { charisma: 3, mind: 1, endurance: -1 },
    },
    {
      value: 'wlamywacz',
      label: 'Breacher',
      description:
        'System breacher and netrunner. Every wall has a door. They find it.',
      modifiers: { mind: 3, perception: 2, strength: -2 },
    },
    {
      value: 'ostrze',
      label: 'Blade',
      description:
        'Street enforcer, chrome and edge. The job is simple. So is the solution.',
      modifiers: { strength: 2, agility: 2, mind: -1 },
    },
    {
      value: 'mechanik',
      label: 'Mechanic',
      description:
        'Tech specialist and drone operator. Anything with a circuit can be made to obey.',
      modifiers: { mind: 2, endurance: 2, charisma: -1 },
    },
    {
      value: 'cien',
      label: 'Shadow',
      description:
        'Operative and assassin. No face, no name, no trace. The contract is everything.',
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

// ============================================================
// HP CALCULATION
// Consistent with src/features/character/lib/hp.ts
// BASE_HP + (endurance * HP_PER_ENDURANCE)
// ============================================================

export const BASE_HP = 50
export const HP_PER_ENDURANCE = 10

export const calculateMaxHp = (enduranceTotal: number): number => {
  return BASE_HP + enduranceTotal * HP_PER_ENDURANCE
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

export const ATTRIBUTE_XP_THRESHOLD = 100
export const CHARACTER_XP_PER_SESSION = 50

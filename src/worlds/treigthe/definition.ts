import type { WorldDefinitionInput } from '../schema'

/**
 * Tréigthe (The Forsaken) — dark Slavic-Celtic grimdark fantasy.
 *
 * Data copied 1:1 from features/character/constants/:
 * - card metadata from worlds.ts
 * - gender options from gender.ts (WORLD_GENDER_OPTIONS.treigthe)
 * - races/classes/attribute labels from fantasy/treigthe.ts
 * Class icons (TREIGTHE_CLASS_ICONS) intentionally stay in their file.
 */

// Literal unions kept so existing imports (e.g. CHARACTER_PORTRAITS key
// typing) can be re-pointed here when constants/index.ts is retired.
export type TreigtheRace = 'scarred' | 'duskborn' | 'stonewarden' | 'demigod'

export type TreigtheClass =
  | 'graveblade'
  | 'bleeder'
  | 'ashwalker'
  | 'last_breath_priest'

const RACE_PORTRAITS = '/images/fantasy/treigthe/characters/races/'

export const treigthe: WorldDefinitionInput = {
  value: 'treigthe',
  genre: 'fantasy',
  // From worlds.ts — StepWorld card, verbatim
  name: 'Tréigthe',
  subtitle: 'The Forsaken',
  description:
    'A dark Celtic-Slavic realm where the gods died centuries ago, their ' +
    'corpses rotting in the heavens. Magic is real, but nothing is free — ' +
    'every spell costs blood, years, or memory.',
  startingLocation: 'cathair-luaith', // slug — must match locationsTable.slug in seed/treigthe.ts

  // From TREIGTHE_ATTRIBUTE_LABELS
  attributeLabels: {
    strength: 'Strength',
    mind: 'Intellect',
    endurance: 'Constitution',
    agility: 'Dexterity',
    charisma: 'Presence',
    perception: 'Awareness',
  },

  // From gender.ts — WORLD_GENDER_OPTIONS.treigthe, verbatim
  genderOptions: [
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

  // From TREIGTHE_RACES — descriptions, modifiers and portraits verbatim
  races: [
    {
      value: 'scarred',
      label: 'Scarred',
      description:
        "Survivors marked by the gods' fall. Adaptable, distrustful, and " +
        'harder to kill than they should be.',
      modifiers: { strength: 1, endurance: 1 },
      startingEquipment: [
        { name: 'Patchwork Cloak', qty: 1, slots: 2 },
        { name: 'Iron Ration', qty: 3 },
        { name: 'Hidden Knife', qty: 1 },
      ],
      genderless: false,
      femalePortraitUrl: `${RACE_PORTRAITS}scarred-female.jpg`,
      malePortraitUrl: `${RACE_PORTRAITS}scarred-male.jpg`,
    },
    {
      value: 'duskborn',
      label: 'Duskborn',
      description:
        'Ancient elves slowly fading from the world. They remember the ' +
        'living gods — and the night they died.',
      modifiers: { mind: 2, perception: 2, endurance: -1 },
      startingEquipment: [
        { name: 'Memory Shard', qty: 1 },
        { name: 'Fading Cloak', qty: 1, slots: 2 },
        { name: 'Ash Vial', qty: 1 },
      ],
      genderless: false,
      femalePortraitUrl: `${RACE_PORTRAITS}duskborn-female.jpg`,
      malePortraitUrl: `${RACE_PORTRAITS}duskborn-male.jpg`,
    },
    {
      value: 'stonewarden',
      label: 'Stonewarden',
      description:
        'Dwarf guardians of the god-tombs. Patient, secretive, and bound ' +
        'by duties older than memory.',
      modifiers: { endurance: 3, strength: 1, agility: -1 },
      startingEquipment: [
        { name: 'Tomb Key', qty: 1 },
        { name: "Warden's Seal", qty: 1 },
        { name: 'Stone Lamp', qty: 1, slots: 2 },
      ],
      genderless: false,
      femalePortraitUrl: `${RACE_PORTRAITS}stonewarden-female.jpg`,
      malePortraitUrl: `${RACE_PORTRAITS}stonewarden-male.jpg`,
    },
    {
      value: 'demigod',
      label: 'Fadeborn',
      description:
        'Offspring of a fading god and a mortal. Neither fully divine nor ' +
        'fully human — a body caught between, carrying a fraction of power ' +
        'it was never meant to hold. Their kind know no sex, only the slow, ' +
        'uneven weight of incomplete divinity.',
      modifiers: { charisma: 3, strength: 2, endurance: -2 },
      startingEquipment: [
        { name: 'Godsblood Vial', qty: 1 },
        { name: 'Binding Wraps', qty: 1, slots: 2 },
        { name: 'Broken Idol', qty: 1 },
      ],
      genderless: true, // wizard skips the Sex step
      portraitUrl: `${RACE_PORTRAITS}demigod.jpg`,
    },
  ],

  // From TREIGTHE_CLASSES — descriptions and modifiers verbatim
  classes: [
    {
      value: 'graveblade',
      label: 'Graveblade',
      description:
        'Mercenary with no allegiance and no illusions. Fights for coin. ' +
        "Survives because others don't.",
      modifiers: { strength: 2, endurance: 2 },
      startingEquipment: [
        { name: 'Notched Longsword', qty: 1, slots: 2 },
        { name: 'Boiled Leather Armor', qty: 1, slots: 3 },
        { name: 'Coin Pouch', qty: 1 },
        { name: 'Whetstone', qty: 1 },
      ],
    },
    {
      value: 'bleeder',
      label: 'Bleeder',
      description:
        'Echo mage who pays with their body. Every spell costs something ' +
        'real — blood, years, memory.',
      modifiers: { mind: 3, perception: 1, endurance: -1 },
      startingEquipment: [
        { name: 'Bleeding Knife', qty: 1 },
        { name: 'Bloodied Bandages', qty: 3 },
        { name: 'Echo Focus', qty: 1 },
        { name: 'Tally Cord', qty: 1 },
      ],
    },
    {
      value: 'ashwalker',
      label: 'Ashwalker',
      description:
        'Smuggler, spy, shadow. Moves between worlds without being seen. ' +
        'Knows where the tunnels are.',
      modifiers: { agility: 3, perception: 1, strength: -1 },
      startingEquipment: [
        { name: 'Hooked Dagger', qty: 1 },
        { name: "Smuggler's Cloak", qty: 1, slots: 2 },
        { name: 'Lockpicks', qty: 1 },
        { name: 'Tunnel Map', qty: 1 },
      ],
    },
    {
      value: 'last_breath_priest', // underscores kept — match portrait filenames
      label: 'Last Breath Priest',
      description:
        'Priest of the dead gods. Does not heal — curses. The Church ' +
        "tolerates them. Most people don't.",
      modifiers: { charisma: 2, mind: 2, agility: -1 },
      startingEquipment: [
        { name: 'Curse Censer', qty: 1, slots: 2 },
        { name: 'Rite Book', qty: 1, slots: 2 },
        { name: 'Bone Rosary', qty: 1 },
        { name: 'Grave Ash', qty: 2 },
      ],
    },
  ],

  // From portraits.ts — buildClassPortraitUrl in the registry uses this
  classPortraitsBaseUrl: '/images/fantasy/treigthe/characters/classes/',

  // TODO: if your buildSystemPrompt already has richer world text,
  // paste it over these two fields — structure stays the same.
  prompt: {
    intro:
      'You are the Game Master of Tréigthe (The Forsaken), a dark ' +
      'Celtic-Slavic realm where the gods died centuries ago, their corpses ' +
      'rotting in the heavens. Magic is real, but nothing is free — every ' +
      'spell costs blood, years, or memory. Key locations include Cathair ' +
      'Luaith, Baile Fola and An Dún Liath.',
    tone:
      'Grimdark, melancholic, folk-horror. Magic always has a visible, ' +
      'personal cost. Hope is scarce and hard-won. NPC secrets follow the ' +
      'TIER SECRET system: reveal hidden truths only gradually, through ' +
      'hints and consequences, never as direct exposition.',
  },

  enabled: true,
}

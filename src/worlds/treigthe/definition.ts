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

  // Item metadata — keyed by the exact name used in startingEquipment above.
  // Items the GM invents at runtime (loot, /additem) won't be here; the UI falls back.
  items: {
    // ── Scarred ──
    'Patchwork Cloak': {
      description:
        'Stitched from three coats, none of them yours. Warm enough. Nobody asks whose they were.',
      category: 'armor',
    },
    'Iron Ration': {
      description:
        'Hard bread, salt meat, something dried. Tastes of nothing. Keeps you walking.',
      category: 'consumable',
    },
    'Hidden Knife': {
      description:
        'Not a weapon — a reflex. Small enough to forget you are carrying it, until you need it.',
      category: 'weapon',
    },

    // ── Duskborn ──
    'Memory Shard': {
      description:
        'A splinter of black glass. Tilted to the light, it still shows a god that breathes.',
      category: 'relic',
    },
    'Fading Cloak': {
      description:
        'The weave thins where you touch it. It is going the same way you are, only faster.',
      category: 'armor',
    },
    'Ash Vial': {
      description:
        'Grey dust from the night the heavens died. Your people kept it. Nobody remembers why.',
      category: 'relic',
    },

    // ── Stonewarden ──
    'Tomb Key': {
      description:
        'Cold iron, worn smooth. It opens something. You have never been told what.',
      category: 'tool',
    },
    "Warden's Seal": {
      description:
        'Proof of an office older than the Church. Show it rarely. It is a debt, not a privilege.',
      category: 'relic',
    },
    'Stone Lamp': {
      description:
        'Burns without air, deep below. The flame is the wrong colour and you have stopped noticing.',
      category: 'tool',
    },

    // ── Fadeborn (demigod) ──
    'Godsblood Vial': {
      description:
        'Your own blood, drawn and stoppered. It has not clotted. It has not stopped moving.',
      category: 'relic',
    },
    'Binding Wraps': {
      description:
        'Linen, wound tight. Not for wounds — for holding a body together that would rather come apart.',
      category: 'armor',
    },
    'Broken Idol': {
      description:
        'A small carving of your divine parent. The face is gone. You did not break it.',
      category: 'relic',
    },

    // ── Graveblade ──
    'Notched Longsword': {
      description:
        'Every notch is a contract that went badly. The blade is honest about what it is for.',
      category: 'weapon',
    },
    'Boiled Leather Armor': {
      description:
        'Hardened, scarred, repaired badly. It has already failed once and you are still here.',
      category: 'armor',
    },
    'Coin Pouch': {
      description:
        'Light. It is always light. That is why you take the next job.',
      category: 'misc',
    },
    Whetstone: {
      description:
        'The one ritual you keep. Drag, turn, drag. It settles the hands before the work.',
      category: 'tool',
    },

    // ── Bleeder ──
    'Bleeding Knife': {
      description:
        'Thin, clean, and meant for you. Every spell begins here. The blade never dulls; you do.',
      category: 'weapon',
    },
    'Bloodied Bandages': {
      description:
        'Used, dried, folded again. You reuse them. Fresh linen is for people who cast less.',
      category: 'consumable',
    },
    'Echo Focus': {
      description:
        'A knot of bone and wire that hums when the magic answers. It is warm. It should not be.',
      category: 'relic',
    },
    'Tally Cord': {
      description:
        'One knot for every year, memory or litre already spent. You do not count them out loud.',
      category: 'misc',
    },

    // ── Ashwalker ──
    'Hooked Dagger': {
      description:
        'Curved to catch and pull. A tool first, a weapon when the tunnel runs out.',
      category: 'weapon',
    },
    "Smuggler's Cloak": {
      description:
        'Dark, unremarkable, deep-pocketed. Designed to make a witness forget they saw anyone.',
      category: 'armor',
    },
    Lockpicks: {
      description:
        'Six picks in an oilcloth roll. Two are bent. Those two are the ones that work.',
      category: 'tool',
    },
    'Tunnel Map': {
      description:
        'Somebody else drew this, and they died before finishing. The gaps are where the trouble is.',
      category: 'tool',
    },

    // ── Last Breath Priest ──
    'Curse Censer': {
      description:
        'Swung at funerals, but never in blessing. What rises from it settles on someone.',
      category: 'relic',
    },
    'Rite Book': {
      description:
        'Burial rites in the front. The other rites are in the back, in a hand that is not the scribe\u2019s.',
      category: 'tool',
    },
    'Bone Rosary': {
      description:
        'Finger bones, strung and told one by one. Each one belonged to somebody who asked you for help.',
      category: 'relic',
    },
    'Grave Ash': {
      description:
        'Scraped from a pyre that burned wrong. It marks doors, thresholds, and the dying.',
      category: 'consumable',
    },
  },

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

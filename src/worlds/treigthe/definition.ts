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
      keyAttribute: 'strength',
      growth: { primary: 'strength', secondary: 'endurance' },
      // ───────────────────────────────────────────────────────────────────────────
      // GRAVEBLADE — makes others pay
      //
      // keyAttribute: 'strength'
      // growth: { primary: 'strength', secondary: 'endurance' }
      //
      // No magic. No echo. Just a professional who has outlived everyone who
      // wasn't. Cheap, reliable, and utterly ordinary — which is the point.
      // ───────────────────────────────────────────────────────────────────────────

      abilities: [
        {
          value: 'killing_work',
          name: 'Killing Work',
          tier: 1,
          description:
            'No flourish, no speech. You find the gap in the guard and you end ' +
            'it, the way other men chop wood.',
          gmGuidance:
            'A decisive, lethal strike on one opponent; narrate it as efficient ' +
            'work rather than heroism.',
        },
        {
          value: 'no_illusions',
          name: 'No Illusions',
          tier: 1,
          description:
            'You have been lied to by better liars than this. Threats bore you. ' +
            'Promises bore you. You see what a man is about to do before he does.',
          gmGuidance:
            'Sees through deception, intimidation and false promise, and reads a ' +
            'threat before it lands.',
        },
        {
          value: 'butchers_work',
          name: "Butcher's Work",
          tier: 2,
          evolvesFrom: 'killing_work',
          description:
            'One pass. You do not stop between them, and they do not have time ' +
            'to become a crowd.',
          gmGuidance:
            'As Killing Work, but carried through several opponents in one ' +
            'sustained pass.',
        },
        {
          value: 'first_to_move',
          name: 'First to Move',
          tier: 2,
          evolvesFrom: 'no_illusions',
          description:
            'The ambush was well laid. You were simply already moving when it ' +
            'closed.',
          gmGuidance:
            'Acts before an ambush or betrayal can close; never caught ' +
            'flat-footed, never surprised.',
        },
        {
          value: 'last_one_standing',
          name: 'Last One Standing',
          tier: 3,
          capstone: true,
          description:
            'Others die. That is the arrangement, and it has held for twenty ' +
            'years. You have never once asked why it is not you.',
          gmGuidance:
            'Once per campaign, when death is certain, someone else takes it ' +
            'instead — name who dies in their place and let the character walk away.',
          cost: {
            kind: 'narrative',
            note: 'someone else dies in their place — named by the GM',
          },
        },
      ],
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
      keyAttribute: 'mind',
      growth: { primary: 'mind', secondary: 'endurance' },
      // ───────────────────────────────────────────────────────────────────────────
      // BLEEDER — pays with their own body
      //
      // keyAttribute: 'mind'
      // growth: { primary: 'mind', secondary: 'endurance' }
      //
      // The balance rule that makes the HP cost fair: a Bleeder does what nobody
      // else can. Not "hits harder" — does the impossible. If an ordinary person
      // with a knife could achieve it, it is not Bleeder work, and the GM should
      // not let the player spend blood on it.
      // ───────────────────────────────────────────────────────────────────────────

      abilities: [
        {
          value: 'bloodcast',
          name: 'Bloodcast',
          tier: 1,
          description:
            'Open a vein and force the echo to answer. A door slams with no ' +
            'hand on it. A fire gutters out. A man leaves the ground. Small ' +
            'impossibilities, bought in blood.',
          gmGuidance:
            'Bends the physical world in a small, impossible way — never something ' +
            'a knife could do; deduct 5 HP in the snapshot and show the blood price.',
          cost: { kind: 'hp', amount: 5 },
        },
        {
          value: 'toll_of_years',
          name: 'Toll of Years',
          tier: 1,
          description:
            'Some things blood cannot buy. Spend a year, or a face you loved, ' +
            'and the echo reaches further back than it should — closing what ' +
            'was opened, asking what the dead still know.',
          gmGuidance:
            'Undoes or reaches past what should be fixed — seals a mortal wound, ' +
            'questions a corpse, opens what was sealed for centuries — and the ' +
            'character permanently loses a named year or memory, stated in the prose.',
          cost: {
            kind: 'narrative',
            note: 'a year of life, or a specific memory — named in the prose',
          },
        },
        {
          value: 'crimson_echo',
          name: 'Crimson Echo',
          tier: 2,
          evolvesFrom: 'bloodcast',
          description:
            'The echo no longer stops where you do. It spreads down the street, ' +
            'through the walls, into everyone standing in it.',
          gmGuidance:
            'As Bloodcast, but it takes a whole space at once or holds for the ' +
            'length of a scene; deduct 8 HP in the snapshot.',
          cost: { kind: 'hp', amount: 8 },
        },
        {
          value: 'the_long_price',
          name: 'The Long Price',
          tier: 2,
          evolvesFrom: 'toll_of_years',
          description:
            'You have learned to haggle. The echo reaches further and takes more, ' +
            'and you can feel exactly how much of you is left to spend.',
          gmGuidance:
            'As Toll of Years but scene-altering, and the price shows on the body — ' +
            'grey hair, a lost name, a hollowed look that does not fade.',
          cost: {
            kind: 'narrative',
            note: 'years, or a memory the character will visibly miss',
          },
        },
        {
          value: 'everything_costs_something',
          name: 'Everything Costs Something',
          tier: 3,
          capstone: true,
          description:
            'The last lesson of the echo: nothing is given. Break the world open ' +
            'once — and pay for it for the rest of your life.',
          gmGuidance:
            'Once per campaign, a devastating rupture in the world; invent a ' +
            'permanent price the character carries for the rest of the campaign.',
          cost: { kind: 'narrative', note: 'permanent — chosen by the GM' },
        },
      ],
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
      keyAttribute: 'agility',
      growth: { primary: 'agility', secondary: 'perception' },
      // ───────────────────────────────────────────────────────────────────────────
      // ASHWALKER — avoids the reckoning
      //
      // keyAttribute: 'agility'
      // growth: { primary: 'agility', secondary: 'perception' }
      //
      // Never pays because they are never there when the bill arrives. The only
      // class whose capstone is an escape rather than a blow.
      // ───────────────────────────────────────────────────────────────────────────

      abilities: [
        {
          value: 'unseen',
          name: 'Unseen',
          tier: 1,
          description:
            'You were in the room the whole time. Nobody will remember you being ' +
            'in the room.',
          gmGuidance:
            'Moves, acts and leaves without being noticed, even under watch.',
        },
        {
          value: 'knows_the_tunnels',
          name: 'Knows the Tunnels',
          tier: 1,
          description:
            'Every wall has a way past it. Every district has a man who owes you. ' +
            'You have never been anywhere with only one exit.',
          gmGuidance:
            'Always knows a way in, a way out or a way around — a hidden route, a ' +
            'back door, a contact who owes them.',
        },
        {
          value: 'ghost_route',
          name: 'Ghost Route',
          tier: 2,
          evolvesFrom: 'unseen',
          description:
            'You can take someone with you now. They will not understand how, and ' +
            'you will not explain.',
          gmGuidance:
            'As Unseen, but brings another person or a sizeable object through ' +
            'unnoticed with them.',
        },
        {
          value: 'no_locked_doors',
          name: 'No Locked Doors',
          tier: 2,
          evolvesFrom: 'knows_the_tunnels',
          description:
            'Locks, walls, guarded gates, sealed tombs. A delay. Never a stop.',
          gmGuidance:
            'No barrier holds them completely; locks, walls and seals cost time, ' +
            'never access.',
        },
        {
          value: 'between_worlds',
          name: 'Between Worlds',
          tier: 3,
          capstone: true,
          description:
            'The trap closes on nothing. You were never quite in it — and ' +
            'something of yours stays behind to prove you were.',
          gmGuidance:
            'Once per campaign, walks out of a situation with no way out; they ' +
            'leave something behind to do it — decide what, and make it hurt.',
          cost: {
            kind: 'narrative',
            note: 'something is left behind — chosen by the GM',
          },
        },
      ],
      startingEquipment: [
        { name: 'Hooked Dagger', qty: 1 },
        { name: "Smuggler's Cloak", qty: 1, slots: 2 },
        { name: 'Lockpicks', qty: 1 },
        { name: 'Tunnel Map', qty: 1 },
      ],
    },
    {
      value: 'last_breath_priest',
      label: 'Last Breath Priest',
      description:
        'Priest of the dead gods. Does not heal — curses. The Church ' +
        "tolerates them. Most people don't.",
      modifiers: { charisma: 2, mind: 2, agility: -1 },
      keyAttribute: 'charisma',
      growth: { primary: 'charisma', secondary: 'mind' },
      // ───────────────────────────────────────────────────────────────────────────
      // LAST BREATH PRIEST — brokers the price of death
      //
      // keyAttribute: 'charisma'
      // growth: { primary: 'charisma', secondary: 'mind' }
      //
      // Does not heal. Curses, and negotiates with gods who are already dead.
      // Last Rites stabilises a dying person — but as a debt, not a mercy.
      // ───────────────────────────────────────────────────────────────────────────

      abilities: [
        {
          value: 'witherword',
          name: 'Witherword',
          tier: 1,
          description:
            'You say the word into a man and it settles in him. His grip loosens. ' +
            'His luck sours. Something in him begins to go bad.',
          gmGuidance:
            'A curse laid on one target: they weaken, sicken, or their luck turns ' +
            'against them for the rest of the scene.',
        },
        {
          value: 'last_rites',
          name: 'Last Rites',
          tier: 1,
          description:
            'You do not heal them. You hand them to the dead gods and ask, ' +
            'politely, for a little longer. The gods keep accounts.',
          gmGuidance:
            'Stops a dying person from dying — not by healing but by promising ' +
            'them to the dead gods; record the debt in the prose, and collect it later.',
          cost: {
            kind: 'narrative',
            note: 'a debt to the dead gods, collected later',
          },
        },
        {
          value: 'blight',
          name: 'Blight',
          tier: 2,
          evolvesFrom: 'witherword',
          description:
            'The word no longer settles. It grows. It spreads from the man to his ' +
            'bread, his house, the people who touch him.',
          gmGuidance:
            'As Witherword, but the curse persists across scenes and spreads to ' +
            'what the target touches — rot and ruin, not blood.',
        },
        {
          value: 'toll_the_bell',
          name: 'Toll the Bell',
          tier: 2,
          evolvesFrom: 'last_rites',
          description:
            'One word, in the language nobody living was taught. The dead hear it ' +
            'and remember they are dead.',
          gmGuidance:
            'A word of dread: the undead falter and the fearful break, and those ' +
            'who hold recognise the priest for what they are.',
        },
        {
          value: 'deaths_warrant',
          name: "Death's Warrant",
          tier: 3,
          capstone: true,
          description:
            'You name one person to the dead gods. They agree. They always agree — ' +
            'and they take their fee from you as well.',
          gmGuidance:
            'Once per campaign, a curse the dead gods enforce against one named ' +
            'target; they take payment from the priest too — say what it costs them.',
          cost: {
            kind: 'narrative',
            note: 'the dead gods take their due from the priest as well',
          },
        },
      ],

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

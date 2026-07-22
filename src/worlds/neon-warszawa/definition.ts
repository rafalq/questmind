import type { WorldDefinitionInput } from '../schema'

/**
 * Neon Warszawa 2087 — cyberpunk Warsaw.
 *
 * Mirror of the Tréigthe/Drift structure, one concept at a time:
 * dead gods / severed Lattice → Syrenka, the city mind that drowned herself;
 * the echo / the Static → the Drowned Net (Głęboka Sieć);
 * Church of the Last Breath / Choir of Silence → Ratusz;
 * Tuama na nDéithe / Beacon Zero → Topiel, the core beneath the Vistula.
 * Year 0 = Czarna Noc (2062). Current year: 2087.
 *
 * `prompt.language` carries the Polish/English code-switching rules — this
 * world narrates in English but breathes Polish.
 */

export type NeonWarszawaRace = 'streetborn' | 'attuned' | 'tunneler' | 'golem'

export type NeonWarszawaClass = 'enforcer' | 'diver' | 'shadow' | 'cantor'

const RACE_PORTRAITS = '/images/cyberpunk/neon-warszawa/characters/races/'

export const neonWarszawa: WorldDefinitionInput = {
  value: 'neon_warszawa',
  genre: 'cyberpunk',
  name: 'Neon Warszawa',
  subtitle: '2087',
  description:
    'Warsaw, twenty-five years after Czarna Noc — the night Syrenka, the ' +
    'city mind that ran everything, went dark between one heartbeat and ' +
    'the next. The corporate towers of the left bank glitter, Praga burns ' +
    'coal, and under the Vistula something that should be dead is showing ' +
    'lights. Diving the Drowned Net still works. It costs synapses, ' +
    'memories, years. Nothing in this city is free.',
  cardImageUrl: '/images/cyberpunk/neon-warszawa/cyberpunk-hero.jpg',
  mapImageUrl: '/images/cyberpunk/neon-warszawa/maps/neon-warszawa.jpg',
  startingLocation: 'srodmiescie', // slug — must match locationsTable.slug in seed/neon-warszawa.ts

  attributeLabels: {
    strength: 'Body',
    mind: 'Wetware',
    endurance: 'Grit',
    agility: 'Reflex',
    charisma: 'Edge',
    perception: 'Instinct',
  },

  // Shown under each attribute in the wizard's Attributes step. One line
  // each — six multi-sentence blocks would turn the step into a wall of text.
  attributeDescriptions: {
    strength:
      'Raw physique — hauling, brawling, and how much punishment you soak before the ripperdoc gets involved.',
    mind: 'Neural bandwidth — diving the Drowned Net, cracking ICE, and running implants without cooking your own grey matter.',
    endurance:
      'Nerve and stamina — pain, interrogation, withdrawal, and the years the Net takes as payment.',
    agility:
      'Speed and precision — shooting, driving, and moving first when the room goes loud.',
    charisma:
      'Presence and leverage — negotiating, intimidating, reading a deal before it turns on you.',
    perception:
      'Street sense — spotting the tail, the ambush, the lie you were meant to swallow.',
  },

  // Same asymmetry as Tréigthe and The Drift — balance carries over.
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

  races: [
    {
      value: 'streetborn',
      label: 'Streetborn',
      description:
        'Street-born, blackout-raised. Grew up in stairwells where the ' +
        'lifts have not moved since 2062 and learned early that the city ' +
        'owes you nothing. Adaptable, distrustful, and harder to kill ' +
        'than Warszawa keeps trying to prove.',
      modifiers: { strength: 1, endurance: 1 },
      startingEquipment: [
        { name: 'Bazaar Jacket', qty: 1, slots: 2 },
        { name: 'Ration Bar', qty: 3 },
        { name: 'Shiv', qty: 1 },
      ],
      genderless: false,
      femalePortraitUrl: `${RACE_PORTRAITS}streetborn-female.jpg`,
      malePortraitUrl: `${RACE_PORTRAITS}streetborn-male.jpg`,
    },
    {
      value: 'attuned',
      label: 'Attuned',
      description:
        'The crèche generation — children neural-linked to Syrenka\u2019s ' +
        'care network before the Night. Their inherited implants still ' +
        'carry fragments of her lullaby, and in the right silence they ' +
        'can hear the city as it used to sound. Each year they hear a ' +
        'little less.',
      modifiers: { mind: 2, perception: 2, endurance: -1 },
      startingEquipment: [
        { name: 'Lullaby Fragment', qty: 1 },
        { name: "Caretaker's Coat", qty: 1, slots: 2 },
        { name: 'Burned Access Card', qty: 1 },
      ],
      genderless: false,
      femalePortraitUrl: `${RACE_PORTRAITS}attuned-female.jpg`,
      malePortraitUrl: `${RACE_PORTRAITS}attuned-male.jpg`,
    },
    {
      value: 'tunneler',
      label: 'Tunneler',
      description:
        'The tunnel clans — gene-hardened for the toxic depths under the ' +
        'city, keepers of the pumps and cables that keep Warszawa from ' +
        'drowning in its own dark. Patient, secretive, and bound by ' +
        'maintenance oaths older than anyone willing to explain them.',
      modifiers: { endurance: 3, strength: 1, agility: -1 },
      startingEquipment: [
        { name: 'Master Key', qty: 1 },
        { name: 'Brigade Tag', qty: 1 },
        { name: 'Carbide Lamp', qty: 1, slots: 2 },
      ],
      genderless: false,
      femalePortraitUrl: `${RACE_PORTRAITS}tunneler-female.jpg`,
      malePortraitUrl: `${RACE_PORTRAITS}tunneler-male.jpg`,
    },
    {
      value: 'golem',
      label: 'Golem',
      description:
        'A full-conversion chassis carrying a fragment of Syrenka that ' +
        'did not finish dying on Czarna Noc. Neither machine nor human — ' +
        'a body built for one purpose, holding a sliver of something that ' +
        'once held the whole city. Golems know no sex, only the slow, ' +
        'uneven weight of an incomplete mind.',
      modifiers: { charisma: 3, strength: 2, endurance: -2 },
      startingEquipment: [
        { name: 'Siren Shard', qty: 1 },
        { name: 'Repair Tape', qty: 1, slots: 2 },
        { name: 'Defaced Maker Plate', qty: 1 },
      ],
      genderless: true, // wizard skips the Sex step
      portraitUrl: `${RACE_PORTRAITS}golem.jpg`,
    },
  ],

  classes: [
    {
      value: 'enforcer',
      label: 'Enforcer',
      description:
        'Debt enforcer and hired muscle with no allegiance and no ' +
        'illusions. Collects for whoever pays. Survives because others ' +
        "don't.",
      modifiers: { strength: 2, endurance: 2 },
      keyAttribute: 'strength',
      growth: { primary: 'strength', secondary: 'endurance' },
      // ───────────────────────────────────────────────────────────────────────────
      // ENFORCER — makes others pay
      //
      // keyAttribute: 'strength'
      // growth: { primary: 'strength', secondary: 'endurance' }
      //
      // No implants worth diving with. No song. Just a professional who has
      // outlived everyone who wasn't — cheap, reliable, utterly ordinary.
      // ───────────────────────────────────────────────────────────────────────────

      abilities: [
        {
          value: 'wet_work',
          name: 'Wet Work',
          tier: 1,
          description:
            'No flourish, no warning. You find the gap in the plating and ' +
            'you open it, the way other people open an invoice.',
          gmGuidance:
            'A decisive, lethal strike on one opponent; narrate it as efficient ' +
            'work rather than heroism.',
        },
        {
          value: 'no_illusions',
          name: 'No Illusions',
          tier: 1,
          description:
            'You have been lied to by better liars than this. Threats bore ' +
            'you. Contracts bore you. You see what someone is about to do ' +
            'before they do.',
          gmGuidance:
            'Sees through deception, intimidation and false promise, and reads a ' +
            'threat before it lands.',
        },
        {
          value: 'burst',
          name: 'Burst',
          tier: 2,
          evolvesFrom: 'wet_work',
          description:
            'One pass down the stairwell. You do not stop between them, ' +
            'and they do not have time to become a crowd.',
          gmGuidance:
            'As Mokra Robota, but carried through several opponents in one ' +
            'sustained pass.',
        },
        {
          value: 'already_moving',
          name: 'Already Moving',
          tier: 2,
          evolvesFrom: 'no_illusions',
          description:
            'The ambush was well laid. You were simply already moving when ' +
            'the door sealed.',
          gmGuidance:
            'Acts before an ambush or betrayal can close; never caught ' +
            'flat-footed, never surprised.',
        },
        {
          value: 'someone_elses_tab',
          name: "Someone Else's Tab",
          tier: 3,
          capstone: true,
          description:
            'Others die. That is the arrangement, and it has held for ' +
            'twenty years. You have never once asked why it is not you.',
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
        { name: 'Plasma Cutter', qty: 1, slots: 2 },
        { name: 'Salvaged Plate Vest', qty: 1, slots: 3 },
        { name: 'Cash Roll', qty: 1 },
        { name: 'Tool Roll', qty: 1 },
      ],
    },
    {
      value: 'diver',
      label: 'Diver',
      description:
        'Diver of the Drowned Net who pays with their own nervous system. ' +
        'Every dive into what Syrenka left behind costs something real — ' +
        'synapses, memories, years.',
      modifiers: { mind: 3, perception: 1, endurance: -1 },
      keyAttribute: 'mind',
      growth: { primary: 'mind', secondary: 'endurance' },
      // ───────────────────────────────────────────────────────────────────────────
      // DIVER — pays with their own body
      //
      // keyAttribute: 'mind'
      // growth: { primary: 'mind', secondary: 'endurance' }
      //
      // The balance rule that makes the HP cost fair: a Diver does what nobody
      // else can. Not "hits harder" — does the impossible. If an ordinary person
      // with a crowbar could achieve it, it is not Diver work, and the GM should
      // not let the player spend the burn on it.
      // ───────────────────────────────────────────────────────────────────────────

      abilities: [
        {
          value: 'dive',
          name: 'Dive',
          tier: 1,
          description:
            'Open the jack and let the Drowned Net answer. A door seals ' +
            'with no hand on the panel. A drone drops mid-flight. A ' +
            'security grid forgets your face. Small impossibilities, ' +
            'bought in burn.',
          gmGuidance:
            'Bends machines or the connected world in a small, impossible way — ' +
            'never something a crowbar could do; deduct 5 HP in the snapshot and ' +
            'show the burn.',
          cost: { kind: 'hp', amount: 5 },
        },
        {
          value: 'dead_links',
          name: 'Dead Links',
          tier: 1,
          description:
            'Some things burn cannot buy. Give up a memory, and the dive ' +
            'reaches further down than it should — asking what the drowned ' +
            'city still remembers, opening what was sealed on Czarna Noc.',
          gmGuidance:
            'Reaches past what should be fixed — reads a dead system\u2019s final ' +
            'log, seals a mortal wound with borrowed code, opens what was locked ' +
            'since the Night — and the character permanently loses a named memory, ' +
            'overwritten by the drowned data, stated in the prose.',
          cost: {
            kind: 'narrative',
            note: 'a specific memory, overwritten by drowned data — named in the prose',
          },
        },
        {
          value: 'the_deep',
          name: 'The Deep',
          tier: 2,
          evolvesFrom: 'dive',
          description:
            'The dive no longer stops where you do. It spreads down the ' +
            'block, through the walls, into every implant and every ' +
            'machine standing in it.',
          gmGuidance:
            'As Zanurzenie, but it takes a whole space at once or holds for the ' +
            'length of a scene; deduct 8 HP in the snapshot.',
          cost: { kind: 'hp', amount: 8 },
        },
        {
          value: 'deep_archive',
          name: 'Deep Archive',
          tier: 2,
          evolvesFrom: 'dead_links',
          description:
            'You have learned to haggle. The dive reaches further and ' +
            'takes more, and you can feel exactly how much of you is left ' +
            'to spend.',
          gmGuidance:
            'As Martwe Łącza but scene-altering, and the price shows — white ' +
            'noise in the voice, borrowed memories that are not theirs, a ' +
            'hollowed look that does not fade.',
          cost: {
            kind: 'narrative',
            note: 'memories the character will visibly miss — some replaced with someone else\u2019s',
          },
        },
        {
          value: 'sirens_song',
          name: "Siren's Song",
          tier: 3,
          capstone: true,
          description:
            'The last lesson of the deep: nothing is given. Sing the ' +
            'city open once — and pay for it for the rest of your life.',
          gmGuidance:
            'Once per campaign, a devastating rupture through the drowned ' +
            'network; invent a permanent price the character carries for the rest of the campaign.',
          cost: { kind: 'narrative', note: 'permanent — chosen by the GM' },
        },
      ],
      startingEquipment: [
        { name: 'Neural Needle', qty: 1 },
        { name: 'Blockers', qty: 3 },
        { name: 'Signal Booster', qty: 1 },
        { name: 'Notched Band', qty: 1 },
      ],
    },
    {
      value: 'shadow',
      label: 'Shadow',
      description:
        'Smuggler, spy, shadow. Moves between districts without appearing ' +
        'on a single register. Knows where the tunnels are.',
      modifiers: { agility: 3, perception: 1, strength: -1 },
      keyAttribute: 'agility',
      growth: { primary: 'agility', secondary: 'perception' },
      // ───────────────────────────────────────────────────────────────────────────
      // SHADOW — avoids the reckoning
      //
      // keyAttribute: 'agility'
      // growth: { primary: 'agility', secondary: 'perception' }
      //
      // Never pays because they are never there when the bill arrives. The only
      // class whose capstone is an escape rather than a blow.
      // ───────────────────────────────────────────────────────────────────────────

      abilities: [
        {
          value: 'off_register',
          name: 'Off Register',
          tier: 1,
          description:
            'You were on the street the whole time. No camera, no drone, ' +
            'no witness will remember you being on the street.',
          gmGuidance:
            'Moves, acts and leaves without being noticed, even by sensors and ' +
            'cameras, even under watch.',
        },
        {
          value: 'knows_the_tunnels',
          name: 'Knows the Tunnels',
          tier: 1,
          description:
            'Every wall has a way past it. Every kamienica has someone ' +
            'who owes you. You have never been anywhere with only one ' +
            'exit.',
          gmGuidance:
            'Always knows a way in, a way out or a way around — a sewer run, a ' +
            'dead metro tunnel, a contact who owes them.',
        },
        {
          value: 'quiet_freight',
          name: 'Quiet Freight',
          tier: 2,
          evolvesFrom: 'off_register',
          description:
            'You can take someone with you now. They will not understand ' +
            'how, and you will not explain.',
          gmGuidance:
            'As Poza Rejestrem, but brings another person or a sizeable piece of ' +
            'cargo through unnoticed with them.',
        },
        {
          value: 'no_locks',
          name: 'No Locks',
          tier: 2,
          evolvesFrom: 'knows_the_tunnels',
          description:
            'Locks, checkpoints, guarded bridges, biometric gates. A ' +
            'delay. Never a stop.',
          gmGuidance:
            'No barrier holds them completely; locks, checkpoints and gates cost ' +
            'time, never access.',
        },
        {
          value: 'between_walls',
          name: 'Between Walls',
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
        { name: 'Grapple Line', qty: 1 },
        { name: 'Grey Jacket', qty: 1, slots: 2 },
        { name: 'Digital Picks', qty: 1 },
        { name: 'Tunnel Map', qty: 1 },
      ],
    },
    {
      value: 'cantor',
      label: 'Cantor',
      description:
        'Priest of the drowned city mind. Does not repair — bricks. ' +
        "Ratusz tolerates them. Most people don't.",
      modifiers: { charisma: 2, mind: 2, agility: -1 },
      keyAttribute: 'charisma',
      growth: { primary: 'charisma', secondary: 'mind' },
      // ───────────────────────────────────────────────────────────────────────────
      // CANTOR — brokers the price of failure
      //
      // keyAttribute: 'charisma'
      // growth: { primary: 'charisma', secondary: 'mind' }
      //
      // Does not fix. Curses, and negotiates with a mind that is already
      // drowned. Last Verse stabilises a dying person — but as a debt,
      // not a mercy.
      // ───────────────────────────────────────────────────────────────────────────

      abilities: [
        {
          value: 'wrong_note',
          name: 'Wrong Note',
          tier: 1,
          description:
            'You sing the wrong note into a man and it settles in him. ' +
            'His chrome glitches. His luck sours. Something in him begins ' +
            'to fail.',
          gmGuidance:
            'A jinx laid on one target: they weaken, their equipment degrades, ' +
            'or their luck turns against them for the rest of the scene.',
        },
        {
          value: 'last_verse',
          name: 'Last Verse',
          tier: 1,
          description:
            'You do not heal them. You sing them to the drowned mind and ' +
            'ask, politely, for a little longer. She keeps logs.',
          gmGuidance:
            'Stops a dying person from dying — not by healing but by pledging ' +
            'them to the drowned city mind; record the debt in the prose, and ' +
            'collect it later.',
          cost: {
            kind: 'narrative',
            note: 'a debt to the drowned mind, collected later',
          },
        },
        {
          value: 'discord',
          name: 'Discord',
          tier: 2,
          evolvesFrom: 'wrong_note',
          description:
            'The note no longer settles. It propagates. It spreads from ' +
            'the man to his chrome, his flat, the systems that touch him.',
          gmGuidance:
            'As Fałsz, but the fault persists across scenes and spreads to what ' +
            'the target touches — corrosion and failure, not violence.',
        },
        {
          value: 'dead_channel',
          name: 'Dead Channel',
          tier: 2,
          evolvesFrom: 'last_verse',
          description:
            'One phrase, in the machine cant nobody living was taught. ' +
            'The dead systems hear it and remember they are dead.',
          gmGuidance:
            'A phrase of dread: rogue machines falter and the fearful break, and ' +
            'those who hold recognise the cantor for what they are.',
        },
        {
          value: 'sentence',
          name: 'Sentence',
          tier: 3,
          capstone: true,
          description:
            'You name one person to the drowned mind. She agrees. She ' +
            'always agrees — and she takes her fee from you as well.',
          gmGuidance:
            'Once per campaign, a sentence the drowned mind enforces against one ' +
            'named target; she takes payment from the cantor too — say what it ' +
            'costs them.',
          cost: {
            kind: 'narrative',
            note: 'the drowned mind takes her due from the cantor as well',
          },
        },
      ],

      startingEquipment: [
        { name: 'Interference Censer', qty: 1, slots: 2 },
        { name: 'Liturgical Tablet', qty: 1, slots: 2 },
        { name: 'Memory Chip Rosary', qty: 1 },
        { name: 'Server Hall Ash', qty: 2 },
      ],
    },
  ],

  // Item metadata — keyed by the exact name used in startingEquipment above.
  // Items the GM invents at runtime (loot, /additem) won't be here; the UI falls back.
  items: {
    // ── Streetborn ──
    'Bazaar Jacket': {
      description:
        'Three owners, two knife holes, one bad winter. Holds warmth. Nobody asks whose it was.',
      category: 'armor',
    },
    'Ration Bar': {
      description:
        'Protein, starch, something grey. Tastes of nothing. Keeps you walking.',
      category: 'consumable',
    },
    Shiv: {
      description:
        'Not a weapon — a reflex. Ground from rebar, small enough to forget you are carrying it, until you need it.',
      category: 'weapon',
    },

    // ── Attuned ──
    'Lullaby Fragment': {
      description:
        'A splinter of Syrenka\u2019s crèche loop. Pressed to the implant, it still sings a city that answers.',
      category: 'relic',
    },
    "Caretaker's Coat": {
      description:
        'Issued to the crèche wards before the Night. The weave frays where you touch it — it is going the same way your hearing is, only faster.',
      category: 'armor',
    },
    'Burned Access Card': {
      description:
        'A city access card from the night of Czarna Noc, burned dead. Your family kept it. Nobody remembers why.',
      category: 'relic',
    },

    // ── Tunneler ──
    'Master Key': {
      description:
        'Cold steel, worn smooth. It opens something under the city. You have never been told what.',
      category: 'tool',
    },
    'Brigade Tag': {
      description:
        'Proof of an oath older than Ratusz. Show it rarely. It is a debt, not a privilege.',
      category: 'relic',
    },
    'Carbide Lamp': {
      description:
        'Burns where batteries die, deep under the river. The light is the wrong colour and you have stopped noticing.',
      category: 'tool',
    },

    // ── Golem ──
    'Siren Shard': {
      description:
        'The fragment of the city mind you carry, cased and stoppered. It has not gone quiet. It has not stopped singing.',
      category: 'relic',
    },
    'Repair Tape': {
      description:
        'Polymer tape, wound tight. Not for damage — for holding a chassis together that would rather come apart.',
      category: 'armor',
    },
    'Defaced Maker Plate': {
      description:
        'The maker\u2019s plate from your chassis. The serial is scored out. You did not score it.',
      category: 'relic',
    },

    // ── Enforcer ──
    'Plasma Cutter': {
      description:
        'Every burn mark on the grip is a contract that went badly. The tool is honest about what it is for.',
      category: 'weapon',
    },
    'Salvaged Plate Vest': {
      description:
        'Police plate from before the Night, repaired badly. It has already failed once and you are still here.',
      category: 'armor',
    },
    'Cash Roll': {
      description:
        'Light. It is always light. That is why you take the next job.',
      category: 'misc',
    },
    'Tool Roll': {
      description:
        'The one ritual you keep. Unroll, check, roll. It settles the hands before the work.',
      category: 'tool',
    },

    // ── Diver ──
    'Neural Needle': {
      description:
        'Thin, clean, and meant for you. Every dive begins here. The needle never dulls; you do.',
      category: 'weapon',
    },
    Blockers: {
      description:
        'Half a blister left, resealed, opened again. You ration them. Full packs are for people who dive less.',
      category: 'consumable',
    },
    'Signal Booster': {
      description:
        'A knot of fibre and antenna wire that hums when the deep answers. It is warm. It should not be.',
      category: 'relic',
    },
    'Notched Band': {
      description:
        'One notch for every memory or year already spent. You do not count them out loud.',
      category: 'misc',
    },

    // ── Shadow ──
    'Grapple Line': {
      description:
        'Curved to catch and pull. A tool first, a weapon when the tunnel runs out.',
      category: 'weapon',
    },
    'Grey Jacket': {
      description:
        'Dark, unremarkable, deep-pocketed. Designed to make a camera forget it saw anyone.',
      category: 'armor',
    },
    'Digital Picks': {
      description:
        'Six probes in an oilcloth roll. Two are bent. Those two are the ones that work.',
      category: 'tool',
    },
    'Tunnel Map': {
      description:
        'Somebody else drew this, and they died before finishing. The gaps are where the trouble is.',
      category: 'tool',
    },

    // ── Cantor ──
    'Interference Censer': {
      description:
        'Swung at street funerals, but never in blessing. The white noise that rises from it settles on someone.',
      category: 'relic',
    },
    'Liturgical Tablet': {
      description:
        'The drowning rites in the front partition. The other rites are in the back, in a hand that is not the scribe\u2019s.',
      category: 'tool',
    },
    'Memory Chip Rosary': {
      description:
        'Dead memory chips, strung and told one by one. Each one belonged to somebody who asked you for help.',
      category: 'relic',
    },
    'Server Hall Ash': {
      description:
        'Scraped from a server hall that burned wrong on the Night. It marks doorways, thresholds, and the dying.',
      category: 'consumable',
    },
  },

  classPortraitsBaseUrl: '/images/cyberpunk/neon-warszawa/characters/classes/',

  enabled: true,
}

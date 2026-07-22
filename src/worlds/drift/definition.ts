import type { WorldDefinitionInput } from '../schema'

/**
 * The Drift (The Unmoored) — grimdark sci-fi.
 *
 * Mirror of the Tréigthe structure, one concept at a time:
 * dead gods → the Severed Lattice; the echo → the Static;
 * Church of the Last Breath → Choir of Silence; Tuama na nDéithe → Beacon Zero.
 * Year 0 = the Severance. Current year: 500 AS (After Severance).
 */

// Literal unions kept for parity with TreigtheRace/TreigtheClass so the
// per-world icon map (DRIFT_CLASS_ICONS) can be typed the same way.
export type DriftRace = 'hullborn' | 'lumen' | 'forgeborn' | 'remnant'

export type DriftClass = 'breaker' | 'conduit' | 'voidrunner' | 'silence_cantor'

const RACE_PORTRAITS = '/images/sci-fi/drift/characters/races/'

export const drift: WorldDefinitionInput = {
  value: 'drift',
  genre: 'sci-fi',
  name: 'The Drift',
  subtitle: 'The Unmoored',
  description:
    'A ring of dead ships and broken stations around a dying star. Five ' +
    'centuries ago every beacon in human space went dark in a single night ' +
    '— the Severance. Nobody came. Nobody left. The Static that bleeds ' +
    'from the dead network can still be used, but it burns the user: ' +
    'synapses, memories, years.',
  cardImageUrl: '/images/sci-fi/drift/sci-fi-hero.jpg',
  mapImageUrl: '/images/sci-fi/drift/maps/drift.jpg',
  startingLocation: 'kesslers-rest', // slug — must match locationsTable.slug in seed/drift.ts

  attributeLabels: {
    strength: 'Brawn',
    mind: 'Cognition',
    endurance: 'Resilience',
    agility: 'Reflexes',
    charisma: 'Influence',
    perception: 'Acuity',
  },

  // Shown under each attribute in the wizard's Attributes step. One line
  // each — six multi-sentence blocks would turn the step into a wall of text.
  attributeDescriptions: {
    strength:
      'Muscle under load — shifting cargo in failing gravity, forcing a seized bulkhead, holding a line as the deck pitches.',
    mind: 'Systems literacy — salvage schematics, coaxing dead machinery back, and shaping the Static before it shapes you.',
    endurance:
      'How long you last — recycled air, radiation, short rations, and the years the Static takes as payment.',
    agility:
      'Balance and quick hands in tight spaces — crawlways, zero-g transfers, reaching the lock before it finishes cycling.',
    charisma:
      'Your standing among the unmoored — trading, talking down a mutiny, being believed when you report what you saw out there.',
    perception:
      'The small wrong thing — a tick in the hull, a stale smell on a sealed deck, a face that came aboard uninvited.',
  },

  // Same asymmetry as Tréigthe — kept identical so balance carries over.
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
      value: 'hullborn',
      label: 'Hullborn',
      description:
        'Born in the wrecks, generations deep. They have never seen a ' +
        'planet and do not believe the stories. Adaptable, distrustful, ' +
        'and harder to kill than the Drift keeps trying to prove.',
      modifiers: { strength: 1, endurance: 1 },
      startingEquipment: [
        { name: 'Patched Vacsuit', qty: 1, slots: 2 },
        { name: 'Ration Brick', qty: 3 },
        { name: 'Boot Knife', qty: 1 },
      ],
      genderless: false,
      femalePortraitUrl: `${RACE_PORTRAITS}hullborn-female.jpg`,
      malePortraitUrl: `${RACE_PORTRAITS}hullborn-male.jpg`,
    },
    {
      value: 'lumen',
      label: 'Lumen',
      description:
        'Beacon-keeper bloodlines, their inherited neural laces still ' +
        'carrying engram fragments of the living Lattice. They remember ' +
        'the network — and the night it went silent. Each generation ' +
        'remembers a little less.',
      modifiers: { mind: 2, perception: 2, endurance: -1 },
      startingEquipment: [
        { name: 'Engram Bead', qty: 1 },
        { name: "Keeper's Coat", qty: 1, slots: 2 },
        { name: 'Cold Chip', qty: 1 },
      ],
      genderless: false,
      femalePortraitUrl: `${RACE_PORTRAITS}lumen-female.jpg`,
      malePortraitUrl: `${RACE_PORTRAITS}lumen-male.jpg`,
    },
    {
      value: 'forgeborn',
      label: 'Forgeborn',
      description:
        'Gene-forged for the high-g reactor decks, keepers of the cores ' +
        'that keep the Drift breathing. Patient, secretive, and bound by ' +
        'maintenance oaths older than anyone who could explain them.',
      modifiers: { endurance: 3, strength: 1, agility: -1 },
      startingEquipment: [
        { name: 'Core Key', qty: 1 },
        { name: "Warden's Tag", qty: 1 },
        { name: 'Sodium Lamp', qty: 1, slots: 2 },
      ],
      genderless: false,
      femalePortraitUrl: `${RACE_PORTRAITS}forgeborn-female.jpg`,
      malePortraitUrl: `${RACE_PORTRAITS}forgeborn-male.jpg`,
    },
    {
      value: 'remnant',
      label: 'Remnant',
      description:
        'A synthetic frame carrying a fragment of a ship mind that did ' +
        'not finish dying in the Severance. Neither machine nor human — ' +
        'a body built for one thing, holding a sliver of something built ' +
        'for everything. Their kind know no sex, only the slow, uneven ' +
        'weight of an incomplete mind.',
      modifiers: { charisma: 3, strength: 2, endurance: -2 },
      startingEquipment: [
        { name: 'Mindshard', qty: 1 },
        { name: 'Sealant Wraps', qty: 1, slots: 2 },
        { name: 'Defaced Nameplate', qty: 1 },
      ],
      genderless: true, // wizard skips the Sex step
      portraitUrl: `${RACE_PORTRAITS}remnant.jpg`,
    },
  ],

  classes: [
    {
      value: 'breaker',
      label: 'Breaker',
      description:
        'Salvage mercenary with no allegiance and no illusions. Cuts ' +
        'hulls for scrip and people when the contract says so. Survives ' +
        "because others don't.",
      modifiers: { strength: 2, endurance: 2 },
      keyAttribute: 'strength',
      growth: { primary: 'strength', secondary: 'endurance' },
      // ───────────────────────────────────────────────────────────────────────────
      // BREAKER — makes others pay
      //
      // keyAttribute: 'strength'
      // growth: { primary: 'strength', secondary: 'endurance' }
      //
      // No lace. No Static. Just a professional who has outlived everyone who
      // wasn't. Cheap, reliable, and utterly ordinary — which is the point.
      // ───────────────────────────────────────────────────────────────────────────

      abilities: [
        {
          value: 'clean_work',
          name: 'Clean Work',
          tier: 1,
          description:
            'No flourish, no warning. You find the seam in the armour and ' +
            'you open it, the way other people open hull plate.',
          gmGuidance:
            'A decisive, lethal strike on one opponent; narrate it as efficient ' +
            'work rather than heroism.',
        },
        {
          value: 'seen_it_all',
          name: 'Seen It All',
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
          value: 'chain_cut',
          name: 'Chain Cut',
          tier: 2,
          evolvesFrom: 'clean_work',
          description:
            'One pass down the corridor. You do not stop between them, and ' +
            'they do not have time to become a crowd.',
          gmGuidance:
            'As Clean Work, but carried through several opponents in one ' +
            'sustained pass.',
        },
        {
          value: 'already_moving',
          name: 'Already Moving',
          tier: 2,
          evolvesFrom: 'seen_it_all',
          description:
            'The ambush was well laid. You were simply already moving when ' +
            'the hatch sealed.',
          gmGuidance:
            'Acts before an ambush or betrayal can close; never caught ' +
            'flat-footed, never surprised.',
        },
        {
          value: 'someone_elses_debt',
          name: "Someone Else's Debt",
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
        { name: 'Plasma Cutter', qty: 1, slots: 2 },
        { name: 'Scarred Plate Vest', qty: 1, slots: 3 },
        { name: 'Scrip Roll', qty: 1 },
        { name: 'Tool Roll', qty: 1 },
      ],
    },
    {
      value: 'conduit',
      label: 'Conduit',
      description:
        'Static-user who pays with their own nervous system. Every act ' +
        'of the dead network costs something real — synapses, memories, ' +
        'years.',
      modifiers: { mind: 3, perception: 1, endurance: -1 },
      keyAttribute: 'mind',
      growth: { primary: 'mind', secondary: 'endurance' },
      // ───────────────────────────────────────────────────────────────────────────
      // CONDUIT — pays with their own body
      //
      // keyAttribute: 'mind'
      // growth: { primary: 'mind', secondary: 'endurance' }
      //
      // The balance rule that makes the HP cost fair: a Conduit does what nobody
      // else can. Not "hits harder" — does the impossible. If an ordinary person
      // with a cutter could achieve it, it is not Conduit work, and the GM should
      // not let the player spend the burn on it.
      // ───────────────────────────────────────────────────────────────────────────

      abilities: [
        {
          value: 'staticcast',
          name: 'Staticcast',
          tier: 1,
          description:
            'Open the lace and let the Static answer. A hatch seals with no ' +
            'hand on the panel. A drone drops mid-flight. A gun forgets it ' +
            'is loaded. Small impossibilities, bought in burn.',
          gmGuidance:
            'Bends machines or the physical world in a small, impossible way — ' +
            'never something a cutter could do; deduct 5 HP in the snapshot and ' +
            'show the burn.',
          cost: { kind: 'hp', amount: 5 },
        },
        {
          value: 'ghost_traffic',
          name: 'Ghost Traffic',
          tier: 1,
          description:
            'Some things burn cannot buy. Give up a memory, and the Static ' +
            'reaches further back than it should — asking what the dead ' +
            'ships still remember, opening what was sealed at the Severance.',
          gmGuidance:
            'Reaches past what should be fixed — reads a dead ship\u2019s final ' +
            'log, seals a mortal wound with borrowed code, opens what was locked ' +
            'for centuries — and the character permanently loses a named memory, ' +
            'overwritten by network ghosts, stated in the prose.',
          cost: {
            kind: 'narrative',
            note: 'a specific memory, overwritten by network ghosts — named in the prose',
          },
        },
        {
          value: 'wideband',
          name: 'Wideband',
          tier: 2,
          evolvesFrom: 'staticcast',
          description:
            'The Static no longer stops where you do. It spreads down the ' +
            'deck, through the bulkheads, into every lace and every machine ' +
            'standing in it.',
          gmGuidance:
            'As Staticcast, but it takes a whole space at once or holds for the ' +
            'length of a scene; deduct 8 HP in the snapshot.',
          cost: { kind: 'hp', amount: 8 },
        },
        {
          value: 'deep_archive',
          name: 'Deep Archive',
          tier: 2,
          evolvesFrom: 'ghost_traffic',
          description:
            'You have learned to haggle. The Static reaches further and ' +
            'takes more, and you can feel exactly how much of you is left ' +
            'to spend.',
          gmGuidance:
            'As Ghost Traffic but scene-altering, and the price shows — white ' +
            'noise in the voice, borrowed memories that are not theirs, a ' +
            'hollowed look that does not fade.',
          cost: {
            kind: 'narrative',
            note: 'memories the character will visibly miss — some replaced with someone else\u2019s',
          },
        },
        {
          value: 'carrier_wave',
          name: 'Carrier Wave',
          tier: 3,
          capstone: true,
          description:
            'The last lesson of the Static: nothing is given. Break the ' +
            'Drift open once — and pay for it for the rest of your life.',
          gmGuidance:
            'Once per campaign, a devastating rupture through the dead network; ' +
            'invent a permanent price the character carries for the rest of the campaign.',
          cost: { kind: 'narrative', note: 'permanent — chosen by the GM' },
        },
      ],
      startingEquipment: [
        { name: 'Lace Needle', qty: 1 },
        { name: 'Burn Salve', qty: 3 },
        { name: 'Signal Focus', qty: 1 },
        { name: 'Tally Band', qty: 1 },
      ],
    },
    {
      value: 'voidrunner',
      label: 'Voidrunner',
      description:
        'Smuggler, spy, shadow. Moves between hulks without appearing on ' +
        'a single manifest. Knows where the ducts are.',
      modifiers: { agility: 3, perception: 1, strength: -1 },
      keyAttribute: 'agility',
      growth: { primary: 'agility', secondary: 'perception' },
      // ───────────────────────────────────────────────────────────────────────────
      // VOIDRUNNER — avoids the reckoning
      //
      // keyAttribute: 'agility'
      // growth: { primary: 'agility', secondary: 'perception' }
      //
      // Never pays because they are never there when the bill arrives. The only
      // class whose capstone is an escape rather than a blow.
      // ───────────────────────────────────────────────────────────────────────────

      abilities: [
        {
          value: 'unlogged',
          name: 'Unlogged',
          tier: 1,
          description:
            'You were on the deck the whole time. No camera, no sentry, no ' +
            'witness will remember you being on the deck.',
          gmGuidance:
            'Moves, acts and leaves without being noticed, even by sensors and ' +
            'cameras, even under watch.',
        },
        {
          value: 'knows_the_ducts',
          name: 'Knows the Ducts',
          tier: 1,
          description:
            'Every bulkhead has a way past it. Every hab has someone who ' +
            'owes you. You have never been anywhere with only one airlock.',
          gmGuidance:
            'Always knows a way in, a way out or a way around — a maintenance ' +
            'shaft, a dead lift, a contact who owes them.',
        },
        {
          value: 'ghost_manifest',
          name: 'Ghost Manifest',
          tier: 2,
          evolvesFrom: 'unlogged',
          description:
            'You can take someone with you now. They will not understand ' +
            'how, and you will not explain.',
          gmGuidance:
            'As Unlogged, but brings another person or a sizeable piece of cargo ' +
            'through unnoticed with them.',
        },
        {
          value: 'no_sealed_hatches',
          name: 'No Sealed Hatches',
          tier: 2,
          evolvesFrom: 'knows_the_ducts',
          description:
            'Locks, blast doors, guarded gates, vacuum-welded seals. A ' +
            'delay. Never a stop.',
          gmGuidance:
            'No barrier holds them completely; locks, bulkheads and seals cost ' +
            'time, never access.',
        },
        {
          value: 'between_hulls',
          name: 'Between Hulls',
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
        { name: 'Mag Hook', qty: 1 },
        { name: "Runner's Shroud", qty: 1, slots: 2 },
        { name: 'Bypass Kit', qty: 1 },
        { name: 'Duct Map', qty: 1 },
      ],
    },
    {
      value: 'silence_cantor',
      label: 'Silence Cantor',
      description:
        'Priest of the dead network. Does not repair — bricks. The Choir ' +
        "tolerates them. Most people don't.",
      modifiers: { charisma: 2, mind: 2, agility: -1 },
      keyAttribute: 'charisma',
      growth: { primary: 'charisma', secondary: 'mind' },
      // ───────────────────────────────────────────────────────────────────────────
      // SILENCE CANTOR — brokers the price of failure
      //
      // keyAttribute: 'charisma'
      // growth: { primary: 'charisma', secondary: 'mind' }
      //
      // Does not fix. Curses, and negotiates with minds that are already dead.
      // Last Packet stabilises a dying person — but as a debt, not a mercy.
      // ───────────────────────────────────────────────────────────────────────────

      abilities: [
        {
          value: 'nullword',
          name: 'Nullword',
          tier: 1,
          description:
            'You speak the word into a man and it settles in him. His gear ' +
            'glitches. His luck sours. Something in him begins to fail.',
          gmGuidance:
            'A jinx laid on one target: they weaken, their equipment degrades, ' +
            'or their luck turns against them for the rest of the scene.',
        },
        {
          value: 'last_packet',
          name: 'Last Packet',
          tier: 1,
          description:
            'You do not heal them. You hand them to the dead minds and ' +
            'ask, politely, for a little longer. The minds keep logs.',
          gmGuidance:
            'Stops a dying person from dying — not by healing but by pledging ' +
            'them to the dead ship minds; record the debt in the prose, and ' +
            'collect it later.',
          cost: {
            kind: 'narrative',
            note: 'a debt to the dead minds, collected later',
          },
        },
        {
          value: 'cascade_fault',
          name: 'Cascade Fault',
          tier: 2,
          evolvesFrom: 'nullword',
          description:
            'The word no longer settles. It propagates. It spreads from ' +
            'the man to his suit, his hab, the systems that touch him.',
          gmGuidance:
            'As Nullword, but the fault persists across scenes and spreads to ' +
            'what the target touches — corrosion and failure, not violence.',
        },
        {
          value: 'dead_channel',
          name: 'Dead Channel',
          tier: 2,
          evolvesFrom: 'last_packet',
          description:
            'One word, in the machine cant nobody living was taught. The ' +
            'dead systems hear it and remember they are dead.',
          gmGuidance:
            'A word of dread: rogue machines falter and the fearful break, and ' +
            'those who hold recognise the cantor for what they are.',
        },
        {
          value: 'writ_of_deletion',
          name: 'Writ of Deletion',
          tier: 3,
          capstone: true,
          description:
            'You name one person to the dead minds. They agree. They ' +
            'always agree — and they take their fee from you as well.',
          gmGuidance:
            'Once per campaign, a sentence the dead minds enforce against one ' +
            'named target; they take payment from the cantor too — say what it ' +
            'costs them.',
          cost: {
            kind: 'narrative',
            note: 'the dead minds take their due from the cantor as well',
          },
        },
      ],

      startingEquipment: [
        { name: 'Static Censer', qty: 1, slots: 2 },
        { name: 'Rite Slate', qty: 1, slots: 2 },
        { name: 'Chip Rosary', qty: 1 },
        { name: 'Beacon Ash', qty: 2 },
      ],
    },
  ],

  // Item metadata — keyed by the exact name used in startingEquipment above.
  // Items the GM invents at runtime (loot, /additem) won't be here; the UI falls back.
  items: {
    // ── Hullborn ──
    'Patched Vacsuit': {
      description:
        'Sealed with tape from three different suits, none of them yours. Holds pressure. Nobody asks whose they were.',
      category: 'armor',
    },
    'Ration Brick': {
      description:
        'Protein, starch, something grey. Tastes of nothing. Keeps you walking.',
      category: 'consumable',
    },
    'Boot Knife': {
      description:
        'Not a weapon — a reflex. Ground from ship steel, small enough to forget you are carrying it, until you need it.',
      category: 'weapon',
    },

    // ── Lumen ──
    'Engram Bead': {
      description:
        'A splinter of storage glass. Pressed to the lace, it still shows a network that answers.',
      category: 'relic',
    },
    "Keeper's Coat": {
      description:
        'The weave frays where you touch it. It is going the same way your bloodline is, only faster.',
      category: 'armor',
    },
    'Cold Chip': {
      description:
        'A dead relay chip from the night of the Severance. Your family kept it. Nobody remembers why.',
      category: 'relic',
    },

    // ── Forgeborn ──
    'Core Key': {
      description:
        'Cold alloy, worn smooth. It opens something on the reactor decks. You have never been told what.',
      category: 'tool',
    },
    "Warden's Tag": {
      description:
        'Proof of an oath older than the Choir. Show it rarely. It is a debt, not a privilege.',
      category: 'relic',
    },
    'Sodium Lamp': {
      description:
        'Burns without air, deep in the dark decks. The light is the wrong colour and you have stopped noticing.',
      category: 'tool',
    },

    // ── Remnant ──
    Mindshard: {
      description:
        'The fragment of the ship mind you carry, cased and stoppered. It has not gone quiet. It has not stopped thinking.',
      category: 'relic',
    },
    'Sealant Wraps': {
      description:
        'Polymer tape, wound tight. Not for damage — for holding a frame together that would rather come apart.',
      category: 'armor',
    },
    'Defaced Nameplate': {
      description:
        'The nameplate of the ship you came from. The name is scored out. You did not score it.',
      category: 'relic',
    },

    // ── Breaker ──
    'Plasma Cutter': {
      description:
        'Every burn mark on the grip is a contract that went badly. The tool is honest about what it is for.',
      category: 'weapon',
    },
    'Scarred Plate Vest': {
      description:
        'Salvaged hull plate, repaired badly. It has already failed once and you are still here.',
      category: 'armor',
    },
    'Scrip Roll': {
      description:
        'Light. It is always light. That is why you take the next job.',
      category: 'misc',
    },
    'Tool Roll': {
      description:
        'The one ritual you keep. Unroll, check, roll. It settles the hands before the work.',
      category: 'tool',
    },

    // ── Conduit ──
    'Lace Needle': {
      description:
        'Thin, clean, and meant for you. Every cast begins here. The needle never dulls; you do.',
      category: 'weapon',
    },
    'Burn Salve': {
      description:
        'Half-used, resealed, opened again. You reuse it. Fresh tubes are for people who cast less.',
      category: 'consumable',
    },
    'Signal Focus': {
      description:
        'A knot of fibre and antenna wire that hums when the Static answers. It is warm. It should not be.',
      category: 'relic',
    },
    'Tally Band': {
      description:
        'One notch for every memory or year already spent. You do not count them out loud.',
      category: 'misc',
    },

    // ── Voidrunner ──
    'Mag Hook': {
      description:
        'Curved to catch and pull. A tool first, a weapon when the duct runs out.',
      category: 'weapon',
    },
    "Runner's Shroud": {
      description:
        'Dark, unremarkable, deep-pocketed. Designed to make a camera forget it saw anyone.',
      category: 'armor',
    },
    'Bypass Kit': {
      description:
        'Six probes in an oilcloth roll. Two are bent. Those two are the ones that work.',
      category: 'tool',
    },
    'Duct Map': {
      description:
        'Somebody else drew this, and they died before finishing. The gaps are where the trouble is.',
      category: 'tool',
    },

    // ── Silence Cantor ──
    'Static Censer': {
      description:
        'Swung at airlock funerals, but never in blessing. The white noise that rises from it settles on someone.',
      category: 'relic',
    },
    'Rite Slate': {
      description:
        'Vacuum rites in the front partition. The other rites are in the back, in a hand that is not the scribe\u2019s.',
      category: 'tool',
    },
    'Chip Rosary': {
      description:
        'Dead memory chips, strung and told one by one. Each one belonged to somebody who asked you for help.',
      category: 'relic',
    },
    'Beacon Ash': {
      description:
        'Scraped from a relay that burned wrong. It marks hatches, thresholds, and the dying.',
      category: 'consumable',
    },
  },

  classPortraitsBaseUrl: '/images/sci-fi/drift/characters/classes/',

  enabled: true,
}

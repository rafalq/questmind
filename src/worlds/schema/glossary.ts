// src/worlds/schema/glossary.ts
//
// Player-facing glossary, one entry per term the world uses without
// explaining. Everything here is knowledge a character born in this world
// would have — no secrets, no tier lore, nothing the player has to earn.
//
// Lives in the world registry rather than the database because it describes
// the setting, not its current state: a term does not change when the player
// moves, and nothing at runtime writes to it.

export type GlossaryEntry = {
  /** The term as the fiction spells it. */
  term: string
  /** Literal meaning where the term is not English. */
  translation?: string
  /** One or two sentences. Written in-world, not as a manual. */
  definition: string
  category: 'magic' | 'places' | 'powers' | 'peoples' | 'history' | 'life'
}

export const TREIGTHE_GLOSSARY: GlossaryEntry[] = [
  // ── The cost ────────────────────────────────────────────────────────────
  {
    term: 'the echo',
    definition:
      'What is left of the gods. They died, and the power they held did not — it drains out of their corpses in the sky and can be drawn on by those willing to pay. Nobody in Tréigthe says "magic". They say the echo, the cost, the bleeding.',
    category: 'magic',
  },
  {
    term: 'the cost',
    definition:
      'The price of using the echo, always paid by the caster and always real: blood, years of life, memories, or sanity. There is no such thing as a free working, and anyone who claims otherwise is selling something.',
    category: 'magic',
  },
  {
    term: 'salt',
    definition:
      'Common folk carry it in pouches against the echo. Whether it works is disputed; that people believe it works is not, and the Salt Guild prices accordingly.',
    category: 'life',
  },

  // ── Peoples ─────────────────────────────────────────────────────────────
  {
    term: 'Scarred',
    definition:
      'Survivors marked by the fall of the gods. Adaptable, distrustful, and harder to kill than they have any right to be. The most numerous people in Talamh Liath.',
    category: 'peoples',
  },
  {
    term: 'Duskborn',
    definition:
      'Elves fading slowly out of the world. They remember the gods alive, and the night they died — which is why nobody quite trusts them and nobody quite insults them either.',
    category: 'peoples',
  },
  {
    term: 'Stonewarden',
    definition:
      'Dwarf guardians of the god-tombs, bound by duties older than the Church and older than most written records. Patient, secretive, and unwilling to explain what exactly they are guarding.',
    category: 'peoples',
  },
  {
    term: 'Fadeborn',
    definition:
      'Born of a dying god and a mortal. Neither fully divine nor fully human, carrying a fraction of power they were never built to hold. Their kind know no sex, only the uneven weight of an incomplete divinity.',
    category: 'peoples',
  },

  // ── Trades ──────────────────────────────────────────────────────────────
  {
    term: 'Graveblade',
    definition:
      'A mercenary with no allegiance and no illusions. Fights for coin, survives because others do not. The only trade in this list that costs nothing but everything you meet.',
    category: 'powers',
  },
  {
    term: 'Bleeder',
    definition:
      'An echo mage who pays in body. Every working opens a vein, spends a year, or takes a face they loved. Bleeders do what nobody else can — never what a knife could have done instead.',
    category: 'powers',
  },
  {
    term: 'Ashwalker',
    definition:
      'Smuggler, spy, shadow. Knows every wall with a way past it and every district with a man who owes them. Has never been anywhere with only one exit.',
    category: 'powers',
  },
  {
    term: 'Last Breath Priest',
    definition:
      'A priest of the dead gods who does not heal but curses, and who can hand a dying person to the gods in exchange for a little longer. The gods keep accounts, and they collect.',
    category: 'powers',
  },

  // ── Powers that be ──────────────────────────────────────────────────────
  {
    term: 'Church of the Last Breath',
    definition:
      'The institution that grew out of the gods\u2019 death and has run Talamh Liath since the Grey Fever. It tolerates its own priests and hunts everyone else who touches the echo. Its writ runs strong in Cathair Luaith and thin everywhere else.',
    category: 'history',
  },
  {
    term: 'the Awakeners',
    definition:
      'Those who believe the gods are not finished dying, and are working — quietly, and not always in agreement with one another — to see what happens next.',
    category: 'history',
  },
  {
    term: 'the guilds',
    definition:
      'Salt, rope and barrels. In Baile Fola the guilds hold the harbour and the Church holds one chapel nobody visits. Guild law is the only law there: debts are enforced, and the enforcement is visible on the quayside if you look.',
    category: 'life',
  },

  // ── Places ──────────────────────────────────────────────────────────────
  {
    term: 'Talamh Liath',
    translation: 'Grey Land',
    definition:
      'The region: moorland, peat bog, standing stones, and a sky the colour of a healing wound. Everything in it is within a few days\u2019 walk of everything else.',
    category: 'places',
  },
  {
    term: 'Cathair Luaith',
    translation: 'City of Ash',
    definition:
      'The seat of the Church and the largest city in the region — a place people arrive at rather than choose, usually running from something. The cathedral spire is visible from anywhere in it.',
    category: 'places',
  },
  {
    term: 'Baile Fola',
    translation: 'Town of Blood',
    definition:
      'The southern port, named for the slaughterhouses that fed it through the Grey Fever rather than for any battle. Brine, tar, gulls with no fear of people, and guilds instead of priests.',
    category: 'places',
  },
  {
    term: 'Tuama na nD\u00e9ithe',
    translation: 'Tomb of the Gods',
    definition:
      'Where a god was put, and where the Stonewardens keep their duty. Referred to constantly and visited by almost nobody.',
    category: 'places',
  },
  {
    term: 'Na Sl\u00e9ibhte Dubha',
    translation: 'The Black Mountains',
    definition:
      'The northern range, and the northern waters beyond it. No ship out of Baile Fola has sailed past them in three months. The captains do not explain; they simply refuse the charter.',
    category: 'places',
  },

  // ── History ─────────────────────────────────────────────────────────────
  {
    term: 'Year 0 — the Great War',
    definition:
      'When the gods died. The calendar starts there because nothing before it is agreed on. The current year is 500.',
    category: 'history',
  },
  {
    term: 'the Grey Fever',
    definition:
      'Year 89. The plague that emptied half the region, made the Church what it is, and gave Baile Fola its name.',
    category: 'history',
  },
  {
    term: 'the Night of Ash',
    definition:
      'Year 341. Remembered everywhere, explained nowhere consistently. Ask three people and you will hear three different nights.',
    category: 'history',
  },
]

export const DRIFT_GLOSSARY: GlossaryEntry[] = [
  {
    term: 'the Severance',
    definition:
      'The night every beacon of the Lattice went dark at once, five hundred years ago. Ships mid-jump never arrived. Nobody came, nobody left. The calendar starts there.',
    category: 'history',
  },
  {
    term: 'the Lattice',
    definition:
      'The FTL beacon network that once bound human space together. It has been dead since the Severance, and it is still bleeding.',
    category: 'history',
  },
  {
    term: 'the Static',
    definition:
      'What bleeds out of the dead network. Those with neural laces can channel it, and every use takes something real: burned synapses, overwritten memories, years. Nothing is free.',
    category: 'magic',
  },
  {
    term: 'the Ember',
    definition:
      'The dying red star everything in the Belt orbits. It gives less light every decade and nobody discusses the arithmetic.',
    category: 'places',
  },
  {
    term: 'the Cinder Belt',
    definition:
      'The ring of dead ships, broken stations and salvaged hulks around the Ember. All of human space that anyone alive has seen.',
    category: 'places',
  },
  {
    term: "Kessler's Rest",
    definition:
      'The largest station and the seat of the Choir. Where the Belt keeps its authority, its archives and its silence.',
    category: 'places',
  },
  {
    term: 'Tetherport',
    definition:
      'The spinward docks, named for the kilometre of salvage tethers that kept the first hulls alive through the Thin Air. Run by guilds, not by the Choir.',
    category: 'places',
  },
  {
    term: 'the Dead Flotilla',
    definition:
      'The wrecks at the trailing edge. No crew has flown past them in three months. The pilots do not explain why; they simply refuse the charter.',
    category: 'places',
  },
  {
    term: 'Beacon Zero',
    definition:
      'Somewhere trailing-edge, and the destination of a great many shipments that make no sense as cargo. Spoken about in the way people speak about a grave.',
    category: 'places',
  },
  {
    term: 'the Choir of Silence',
    definition:
      'The institution that grew out of the Severance and has held the Belt since. It tolerates its own Cantors and reports everyone else who touches the Static.',
    category: 'history',
  },
  {
    term: 'the Thin Air',
    definition:
      'Year 89. The season the recyclers failed and the camps cannibalised their own ships to keep breathing. Tetherport took its name afterwards — a name chosen, not given.',
    category: 'history',
  },
  {
    term: 'the Air Guild',
    definition:
      'Controls breath, and breath is power in a Belt that cannot trust its recyclers. Sealed air is also the only thing common folk trust against the Static, so the guild sells fear as well as oxygen.',
    category: 'life',
  },
  {
    term: 'Hullborn',
    definition:
      'Born in the Belt, raised in corridors, weaned on rationed air. Adaptable, distrustful, and harder to kill than the vacuum keeps trying to prove.',
    category: 'peoples',
  },
  {
    term: 'Remnant',
    definition:
      'A frame carrying a fragment of something that did not finish dying at the Severance. Neither machine nor crew. Nobody insults one, because nobody is certain how old it is.',
    category: 'peoples',
  },
  {
    term: 'Conduit',
    definition:
      'Channels the Static through their own nervous system, and pays for it in burn: synapses, memories, years. Does what nobody else can — never what a prybar could have done instead.',
    category: 'powers',
  },
  {
    term: 'Lumen',
    definition:
      'Beacon-keeper bloodlines whose inherited neural laces still carry engram fragments of the living Lattice. They remember the network, and the night it went silent. Each generation remembers a little less.',
    category: 'peoples',
  },
  {
    term: 'Forgeborn',
    definition:
      'Gene-forged for the high-g reactor decks, keepers of the cores that keep the Drift breathing. Bound by maintenance oaths older than anyone who could explain them.',
    category: 'peoples',
  },
  {
    term: 'Breaker',
    definition:
      'Salvage mercenary with no allegiance and no illusions. Cuts hulls for scrip, and people when the contract says so. The only trade here that costs nothing but everything it meets.',
    category: 'powers',
  },
  {
    term: 'Voidrunner',
    definition:
      'Smuggler, spy, shadow. Moves between hulks without appearing on a single manifest, and has never been anywhere with only one hatch.',
    category: 'powers',
  },
  {
    term: 'Silence Cantor',
    definition:
      'A priest of the dead network. Does not repair — bricks. Can pledge a dying person to what is left of the Lattice in exchange for a little longer. It keeps logs, and it collects.',
    category: 'powers',
  },
  {
    term: 'scrip',
    definition:
      'What passes for money in the Belt. Issued by whoever you happen to owe, honoured by whoever happens to need you.',
    category: 'life',
  },
]

export const NEON_WARSZAWA_GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Czarna Noc',
    translation: 'the Black Night',
    definition:
      'The night in 2062 when Syrenka went dark between one heartbeat and the next, taking the grid, the water, the traffic and the Net layer with her. The official story is a cascade failure. The current year is 2087.',
    category: 'history',
  },
  {
    term: 'Syrenka',
    translation: 'the Little Mermaid',
    definition:
      'The municipal superintelligence that ran Warszawa. Named for the city\u2019s emblem, and drowned in the same river the emblem stands on.',
    category: 'history',
  },
  {
    term: 'the Drowned Net',
    translation: 'G\u0142\u0119boka Sie\u0107',
    definition:
      'The dead layers of Syrenka\u2019s network. Still divable by anyone with the right implants, and every dive costs something real: burned synapses, overwritten memories, years.',
    category: 'magic',
  },
  {
    term: 'burn',
    definition:
      'What a dive takes out of the diver. Measured in neuro-scarring by clinicians, in years by everyone else.',
    category: 'magic',
  },
  {
    term: 'Topiel',
    translation: 'the Drowning Deep',
    definition:
      'What is under the Vistula, and where the barges go at dawn. Nobody official uses the word.',
    category: 'places',
  },
  {
    term: 'Ratusz',
    translation: 'the City Hall',
    definition:
      'What runs the left bank now: registers, permits, grid access and the only law that carries weight in \u015ar\u00f3dmie\u015bcie. Its writ thins the moment you cross the river.',
    category: 'history',
  },
  {
    term: '\u015ar\u00f3dmie\u015bcie',
    translation: 'the City Centre',
    definition:
      'The left bank. Corporate glass, holographic advertising bolted onto pre-Night architecture, and a monumental spired tower visible from anywhere in the city.',
    category: 'places',
  },
  {
    term: 'Praga',
    definition:
      'The right bank, and roughly 150,000 people who never trusted Syrenka enough to wire themselves to her. Coal smoke, brick kamienice, string lights running off brigade generators.',
    category: 'places',
  },
  {
    term: 'the brygady',
    translation: 'the brigades',
    definition:
      'What Praga has instead of Ratusz. Brygada Pr\u0105du runs power, the Przewo\u017anicy run the river, the Z\u0142omiarze run salvage. Brigade law is the only law on that side: debts are enforced, and the enforcement is visible on the riverbank if you look.',
    category: 'life',
  },
  {
    term: 'Przewo\u017anicy',
    translation: 'the ferrymen',
    definition:
      'The bridges are checkpointed; the river is not. No ferryman has crossed at night in three months. They do not explain. They simply refuse the fare.',
    category: 'life',
  },
  {
    term: 'Streetborn',
    definition:
      'Blackout-raised, stairwell-raised, taught early that the city owes them nothing. Adaptable, distrustful, and harder to kill than Warszawa keeps trying to prove.',
    category: 'peoples',
  },
  {
    term: 'Attuned',
    definition:
      'The cr\u00e8che generation — children neural-linked to Syrenka\u2019s care network before the Night. Their implants still carry fragments of her lullaby. Each year they hear a little less.',
    category: 'peoples',
  },
  {
    term: 'Tunneler',
    definition:
      'The tunnel clans, gene-hardened for the toxic depths, keepers of the pumps and cables that stop Warszawa drowning in its own dark. Bound by maintenance oaths nobody is willing to explain.',
    category: 'peoples',
  },
  {
    term: 'Golem',
    definition:
      'A full-conversion chassis carrying a fragment of Syrenka that did not finish dying. Golems know no sex, only the uneven weight of an incomplete mind.',
    category: 'peoples',
  },
  {
    term: 'Diver',
    definition:
      'Dives the Drowned Net and pays with their own nervous system. Does what nobody else can — never what a crowbar could have done instead.',
    category: 'powers',
  },
  {
    term: 'Cantor',
    definition:
      'A priest of the drowned city mind. Does not repair — bricks. Can pledge a dying person to Syrenka in exchange for a little longer. She keeps logs, and she collects.',
    category: 'powers',
  },
  {
    term: 'Zimna Zima',
    translation: 'the Cold Winter',
    definition:
      '2065. Praga burned furniture, then fences, then nothing. The brygady formed that winter to ration the generators and have run the district ever since.',
    category: 'history',
  },
]

export const WORLD_GLOSSARIES: Record<string, GlossaryEntry[]> = {
  treigthe: TREIGTHE_GLOSSARY,
  drift: DRIFT_GLOSSARY,
  neon_warszawa: NEON_WARSZAWA_GLOSSARY,
}

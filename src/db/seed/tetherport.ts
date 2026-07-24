// src/db/seed/tetherport.ts
// Adds the second Drift location: Tetherport (the docking sprawl).
// Run with: npx tsx src/db/seed/tetherport.ts
//
// Idempotent: exits if the location already exists.
//
// Mirror of baile-fola.ts: with one location the player can never move, so
// GameSnapshot.location is permanently null and the RAG write path never
// executes. With two, moving swaps the location context AND the NPC cast —
// with no application code involved, because presence is derived from
// primaryLocationId in resolveLore.

// Must stay the first import: it loads .env.local before '@/db' is
// evaluated. See ./env for why the order is not optional.
import './env'

import { db } from '@/db'
import {
  worldsTable,
  regionsTable,
  locationsTable,
  subLocationsTable,
  subLocationLoreTable,
  npcCharactersTable,
  npcLoreTable,
} from '@/db/schema/lore'
import { eq, and } from 'drizzle-orm'

async function seed() {
  console.log('🛰  Seeding Tetherport...')

  const existing = await db.query.locationsTable.findFirst({
    where: eq(locationsTable.slug, 'tetherport'),
  })
  if (existing) {
    console.log('⏭  tetherport already exists — nothing to do.')
    return
  }

  const world = await db.query.worldsTable.findFirst({
    where: eq(worldsTable.slug, 'drift'),
  })
  if (!world) throw new Error('Drift world not seeded. Run drift.ts first.')

  const region = await db.query.regionsTable.findFirst({
    where: and(
      eq(regionsTable.worldId, world.id),
      eq(regionsTable.name, 'The Cinder Belt')
    ),
  })
  if (!region) throw new Error('The Cinder Belt region not found.')

  // ── LOCATION ──────────────────────────────────────────────────────────────

  const [tetherport] = await db
    .insert(locationsTable)
    .values({
      regionId: region.id,
      name: 'Tetherport',
      nameTranslation: 'The Docking Sprawl',
      slug: 'tetherport',
      locationType: 'city',
      sceneTag: 'docking_bay',
      promptContext: `Tetherport — the spinward docks (~12,000 people). Named for the kilometre of salvage tethers that kept the first hulls alive through the Thin Air, not for any harbour. Where Kessler's Rest has the Choir, Tetherport has the guilds: the Air Guild, the Riggers, and the Hullwrights hold the docking ring between them, and the Choir keeps one small chapel here that nobody visits.

Everything smells of coolant, scorched metal and recycler brine. Scaffold quays, black void, dock drones that have learned to keep clear of people. The Choir's writ runs thin this far spinward — a Conduit can work here in the open, for a price, and nobody reports it. Guild law is the only law: debts are enforced, and the enforcement is visible on the docking ring if you look.

No crew has flown trailing-edge past the Dead Flotilla in three months. The pilots do not explain why. They simply refuse the charter.`,
      currentEvents: `The Air Guild has doubled its prices without explanation and is buying every oxygen cell it can find. Two Choir envoys arrived from Kessler's Rest a fortnight ago and have not gone home. Riggers report their instruments going flat near the trailing edge before each power surge — a dead, silent band that arrives minutes ahead of the surge, and the dock drones withdraw first.`,
      history: `Founded Year 40 as a salvage camp. Grew on air and rope. During the Thin Air (Year 89) the camp cannibalised every ship it had to keep the scrubbers running, and took the name Tetherport afterwards — a name chosen, not given. The guilds formed in Year 150 to keep the Choir off the docking ring, and have kept it off since.`,
      isActive: true,
    })
    .returning()

  console.log(`✓ Location: ${tetherport.name}`)

  // ── SUB-LOCATIONS ─────────────────────────────────────────────────────────

  const [airHouse] = await db
    .insert(subLocationsTable)
    .values({
      locationId: tetherport.id,
      name: 'The Air House',
      nameTranslation: 'Air Guild Hall',
      description:
        'The Air Guild hall on the sunward arm of the docking ring. Whitewashed, windowless on the voidward side. The guild meters, prices and licenses every litre of breathable air that leaves Tetherport.',
      atmosphere:
        'Air so dry it cracks the lips — the guild keeps the best mix for the tanks, not the hall. Ledgers, and the sound of a pressure gauge settling.',
      promptContext:
        'The Air Guild controls breath, and breath is power in a Belt that cannot trust its recyclers. The guild masters are civil, exact, and entirely without mercy about debt. Sealed air is also the only thing common folk trust against the Static — they carry salt tabs and bottled air on their belts — so the guild sells fear as well as breath.',
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: airHouse.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['conduit'],
      content:
        "The Air Guild buys lace-clean oxygen cells at four times the standard rate, no questions asked about the source. They will not say what it is for. The order comes from Kessler's Rest and has doubled twice this year.",
    },
    {
      subLocationId: airHouse.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'The Choir is buying the cells through the guild. They are being shipped trailing-edge toward Beacon Zero — an enormous quantity, far past any use for breathing. The Choir is trying to keep something alive out there. It is not working.',
    },
  ])

  const [ventedCrow] = await db
    .insert(subLocationsTable)
    .values({
      locationId: tetherport.id,
      name: 'The Vented Crow',
      nameTranslation: 'The Crow',
      description:
        'A bar welded to the pilings at the end of the voidward arm, half outside the pressure envelope. The floor flexes with the docking cycles. Favoured by crews who have been refused a charter.',
      atmosphere:
        'The deck shifts underfoot. Wet rope, spilled ferment, the smell of the recyclers coming up through the grating. Low ceiling. Everyone sits facing the airlock.',
      promptContext:
        'Where you find people who need to leave and cannot. Pilots drink here between refused charters. If anyone in the Cinder Belt knows what is happening at the trailing edge, they are in this room and they are not sober.',
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: ventedCrow.id,
      tier: 'tier_1',
      applicableRaces: ['remnant'],
      applicableClasses: null,
      content:
        'Remnants drink here without trouble — or sit, at least. The crews are too superstitious to insult anything that might be older than the port, and too tired to care.',
    },
  ])

  console.log('✓ Sub-locations: Air House, Vented Crow')

  // ── NPCs ──────────────────────────────────────────────────────────────────
  // primaryLocationId is what makes the cast change when the player moves.
  // These two must NOT appear while the player is in Kessler's Rest.

  const [maraVoss] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: tetherport.id,
      name: 'Mara Voss',
      portraitUrl: '/images/sci-fi/drift/npcs/mara-voss.webp',
      title: 'Mistress of the Air Guild',
      role: 'faction_leader',
      race: 'hullborn',
      age: 54,
      appearance:
        'Broad, vacuum-weathered, forearms like a dock rigger. Wears no guild finery — a working harness and a knife she has clearly used. Hands permanently stained with sealant.',
      personality:
        'Blunt, transactional, unbothered. Treats every conversation as a negotiation and says so out loud. Laughs easily and it means nothing.',
      motivation:
        'Keep the Choir off her docking ring. She has held that line for nineteen years and she is aware she is currently losing it.',
      secret:
        'She knows the oxygen cells are going to Beacon Zero, because she looked. She has kept the contract anyway — the scrip is keeping the guild alive, and she has told herself she does not need to know. She has begun to need to know.',
      relationships: {
        'Veyra Sol':
          'Never met her. Deals with her envoys. Hates the arrangement and honours it.',
        'Dekker Rho': 'Useful. Watched. Not trusted, and he knows it.',
      },
      promptContext:
        'Mara Voss — Mistress of the Air Guild, 54, Hullborn. Blunt and transactional. Runs the docking ring. Selling enormous quantities of oxygen cells to the Choir and has stopped asking why, which is beginning to cost her sleep.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: maraVoss.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['conduit'],
      content:
        'She will trade with Conduits openly, and price them fairly. Her only rule is that the work happens outside the Air House — not from squeamishness, but because sealed air and the Static do not mix and she will not risk the stock.',
    },
    {
      npcId: maraVoss.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'She has the shipping manifests. They show the destination. She has not wiped them, which tells you what she intends to do eventually.',
    },
  ])

  const [dekkerRho] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: tetherport.id,
      name: 'Dekker Rho',
      portraitUrl: '/images/sci-fi/drift/npcs/dekker-rho.webp',
      title: null,
      role: 'npc_major',
      race: 'hullborn',
      age: 31,
      appearance:
        'Red-bearded, wiry, a long-haul pilot gone deckbound. Coolant-stained flight jacket he has not replaced. Watches the trailing-edge viewport while he talks to you.',
      personality:
        'Talks too much and too fast, and has been drinking since the last surge season. Frightened, and cannot say of what without sounding mad.',
      motivation:
        'Get someone — anyone — to believe him about the trailing edge, so that he can stop being the only one who knows.',
      secret:
        'He flew trailing-edge past the Dead Flotilla four months ago and turned back. He saw the wrecks lit from inside — every dead ship showing running lights at once, as if something beneath the silence had answered a hail. He has not flown since. Two other pilots saw it. One has since been found drifting outside her own airlock, suit intact, tanks full.',
      relationships: {
        'Mara Voss':
          'She lets him drink on credit. He thinks this is kindness.',
      },
      promptContext:
        'Dekker Rho — 31, Hullborn, a pilot who no longer flies. Drinks at the Vented Crow. Talks too much. Saw something at the trailing edge four months ago and has not been believed, and is beginning to prefer being thought a drunk to being thought a liar.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: dekkerRho.id,
      tier: 'tier_1',
      applicableRaces: ['remnant'],
      applicableClasses: null,
      content:
        'He will talk to a Remnant where he would not talk to a Hullborn — he has decided that something that old will not laugh at him.',
    },
  ])

  console.log('✓ NPCs: Mara Voss, Dekker Rho')
  console.log('\n✅ Tetherport seeded.')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

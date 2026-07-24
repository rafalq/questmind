// src/db/seed/praga.ts
// Adds the second Neon Warszawa location: Praga (the right bank).
// Run with: npx tsx src/db/seed/praga.ts
//
// Idempotent: exits if the location already exists.
//
// Mirror of baile-fola.ts / tetherport.ts: with one location the player can
// never move, so GameSnapshot.location is permanently null and the RAG write
// path never executes. With two, moving swaps the location context AND the
// NPC cast — with no application code involved, because presence is derived
// from primaryLocationId in resolveLore.

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
  console.log('🌆 Seeding Praga...')

  const existing = await db.query.locationsTable.findFirst({
    where: eq(locationsTable.slug, 'praga'),
  })
  if (existing) {
    console.log('⏭  praga already exists — nothing to do.')
    return
  }

  const world = await db.query.worldsTable.findFirst({
    where: eq(worldsTable.slug, 'neon_warszawa'),
  })
  if (!world)
    throw new Error(
      'Neon Warszawa world not seeded. Run neon-warszawa.ts first.'
    )

  const region = await db.query.regionsTable.findFirst({
    where: and(
      eq(regionsTable.worldId, world.id),
      eq(regionsTable.name, 'Aglomeracja Warszawska')
    ),
  })
  if (!region) throw new Error('Aglomeracja Warszawska region not found.')

  // ── LOCATION ──────────────────────────────────────────────────────────────

  const [praga] = await db
    .insert(locationsTable)
    .values({
      regionId: region.id,
      name: 'Praga',
      nameTranslation: 'The Right Bank',
      slug: 'praga',
      locationType: 'city',
      sceneTag: 'street_market',
      promptContext: `Praga — the right bank (~150,000, mostly unregistered). The Night barely touched it: Praga never trusted Syrenka enough to wire itself to her, and it does not trust the Ratusz grid now. Coal smoke, brick kamienice, string lights running off brygada generators. Where Śródmieście has Ratusz, Praga has the brygady: Brygada Prądu (power), the Przewoźnicy (the ferrymen — the bridges are checkpointed, the river is not), and the Złomiarze (salvage). Ratusz keeps one small permit office here that nobody visits.

Everything smells of coal, frying oil and river damp. The Bazar Różyckiego trades everything the left bank pretends not to need. Ratusz writ runs thin this side of the river — a Diver can work here in the open, for a price, and nobody reports it. Brygada law is the only law: debts are enforced, and the enforcement is visible on the riverbank if you look.

No ferryman has crossed at night in three months. They do not explain why. They simply refuse the fare.`,
      currentEvents: `Brygada Prądu has doubled its prices without explanation and is buying every industrial capacitor it can find. Two Ratusz envoys arrived from Śródmieście a fortnight ago and have not gone home. Przewoźnicy report their electronics going flat mid-river before each implant echo — a dead, silent band that arrives minutes ahead of the wave, and the river birds go up first.`,
      history: `Praga survived 2062 by not being connected. During the Zimna Zima (2065) it burned furniture, then fences, then nothing — the brygady formed that winter to ration the generators, and have run the district since. Ratusz has tried three times to extend the registers across the river. Three times the paperwork burned.`,
      isActive: true,
    })
    .returning()

  console.log(`✓ Location: ${praga.name}`)

  // ── SUB-LOCATIONS ─────────────────────────────────────────────────────────

  const [domPradu] = await db
    .insert(subLocationsTable)
    .values({
      locationId: praga.id,
      name: 'Dom Prądu',
      nameTranslation: 'The Power House',
      description:
        'Brygada Prądu headquarters in a converted tram depot. The brygada meters, prices and licenses every amp that leaves its generators — and in Praga, every amp is theirs.',
      atmosphere:
        'Diesel heat, humming turbines behind grating, ledgers kept in pencil. The lights here never flicker — the brygada makes a point of it.',
      promptContext:
        'Brygada Prądu controls current, and current is power in a district that will not touch the Ratusz grid. The brygada masters are civil, exact, and entirely without mercy about debt. Off-grid current is also the only thing Praga trusts against the deep — people run their flats one lamp at a time — so the brygada sells fear as well as amps.',
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: domPradu.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['diver'],
      content:
        'Brygada Prądu buys industrial capacitors at four times the standard rate, no questions asked about the source. They will not say what it is for. The order comes from across the river and has doubled twice this year.',
    },
    {
      subLocationId: domPradu.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'Ratusz is buying the capacitors through the brygada. They are being ferried out at dawn and sunk at marked points over the flooded metro — an enormous quantity, far past any civic use. Ratusz is trying to keep something under the river powered. It is not working.',
    },
  ])

  const [podTopielcem] = await db
    .insert(subLocationsTable)
    .values({
      locationId: praga.id,
      name: 'Pod Topielcem',
      nameTranslation: 'Under the Drowned Man',
      description:
        'A bar built onto the old ferry pilings, half over the water. The floor shifts with the river. Favoured by ferrymen who have been refusing fares.',
      atmosphere:
        'The deck moves underfoot. Wet rope, spilled bimber, coal smoke coming off the water. Low ceiling. Everyone sits facing the river.',
      promptContext:
        'Where you find people who need to cross and cannot. Przewoźnicy drink here between refused fares. If anyone in the Aglomeracja knows what is happening under the Vistula, they are in this room and they are not sober.',
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: podTopielcem.id,
      tier: 'tier_1',
      applicableRaces: ['golem'],
      applicableClasses: null,
      content:
        'Golems drink here without trouble — or sit, at least. The ferrymen are too superstitious to insult anything that might remember the river before the Night, and too tired to care.',
    },
  ])

  console.log('✓ Sub-locations: Dom Prądu, Pod Topielcem')

  // ── NPCs ──────────────────────────────────────────────────────────────────
  // primaryLocationId is what makes the cast change when the player moves.
  // These two must NOT appear while the player is in Śródmieście.

  const [grazynaWat] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: praga.id,
      name: 'Grażyna Wat',
      portraitUrl: '/images/cyberpunk/neon-warszawa/npcs/grazyna-wat.webp',
      title: 'Brygadzistka of Brygada Prądu',
      role: 'faction_leader',
      race: 'streetborn',
      age: 54,
      appearance:
        'Broad, weathered, forearms like a cable-layer. Wears no brygada finery — a work harness and a knife she has clearly used. Hands permanently stained with grease and flux.',
      personality:
        'Blunt, transactional, unbothered. Treats every conversation as a negotiation and says so out loud. Laughs easily and it means nothing.',
      motivation:
        'Keep Ratusz off her side of the river. She has held that line for nineteen years and she is aware she is currently losing it.',
      secret:
        'She knows the capacitors are being sunk over the flooded metro, because she followed a barge. She has kept the contract anyway — the złote are keeping the brygada alive, and she has told herself she does not need to know. She has begun to need to know.',
      relationships: {
        'Irena Gawron':
          'Never met her. Deals with her envoys. Hates the arrangement and honours it.',
        'Rysiek Prom': 'Useful. Watched. Not trusted, and he knows it.',
      },
      promptContext:
        'Grażyna Wat — Brygadzistka of Brygada Prądu, 54, Streetborn. Blunt and transactional. Runs the Praga generators. Selling enormous quantities of capacitors to Ratusz and has stopped asking why, which is beginning to cost her sleep.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: grazynaWat.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['diver'],
      content:
        'She will trade with Divers openly, and price them fairly. Her only rule is that the diving happens outside the Dom Prądu — not from squeamishness, but because her turbines and the deep do not mix and she will not risk the load.',
    },
    {
      npcId: grazynaWat.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'She has the barge manifests. They show the drop coordinates over the flooded metro. She has not burned them, which tells you what she intends to do eventually.',
    },
  ])

  const [rysiekProm] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: praga.id,
      name: 'Rysiek Prom',
      portraitUrl: '/images/cyberpunk/neon-warszawa/npcs/rysiek-prom.webp',
      title: null,
      role: 'npc_major',
      race: 'streetborn',
      age: 31,
      appearance:
        'Red-bearded, wiry, a ferryman gone shorebound. Oil-stained river coat he has not replaced. Watches the water while he talks to you.',
      personality:
        'Talks too much and too fast, and has been drinking since the echoes started coming weekly. Frightened, and cannot say of what without sounding mad.',
      motivation:
        'Get someone — anyone — to believe him about the river, so that he can stop being the only one who knows.',
      secret:
        'He took a night fare across four months ago and turned back mid-river. He saw the drowned metro lit from inside — every flooded station showing platform lights at once, as if something beneath the water had answered a bell. He has not crossed since. Two other ferrymen saw it. One has since been found floating face-down by the Poniatowski pylon — dry, with no water in his lungs.',
      relationships: {
        'Grażyna Wat':
          'She lets him drink on credit. He thinks this is kindness.',
      },
      promptContext:
        'Rysiek Prom — 31, Streetborn, a ferryman who no longer crosses. Drinks at Pod Topielcem. Talks too much. Saw something under the river four months ago and has not been believed, and is beginning to prefer being thought a drunk to being thought a liar.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: rysiekProm.id,
      tier: 'tier_1',
      applicableRaces: ['golem'],
      applicableClasses: null,
      content:
        'He will talk to a Golem where he would not talk to an Streetborn — he has decided that something that old will not laugh at him.',
    },
  ])

  console.log('✓ NPCs: Grażyna Wat, Rysiek Prom')
  console.log('\n✅ Praga seeded.')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

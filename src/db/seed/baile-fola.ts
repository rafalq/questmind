// src/db/seed/baile-fola.ts
// Adds the second Tréigthe location: Baile Fola (Town of Blood).
// Run with: npx tsx src/db/seed/baile-fola.ts
//
// Idempotent: exits if the location already exists.
//
// This is what makes the dynamic RAG layer observable. With one location the
// player can never move, so GameSnapshot.location is permanently null and the
// write path never executes. With two, moving swaps the location context AND
// the NPC cast — with no application code involved, because presence is derived
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
  console.log('🌍 Seeding Baile Fola...')

  const existing = await db.query.locationsTable.findFirst({
    where: eq(locationsTable.slug, 'baile-fola'),
  })
  if (existing) {
    console.log('⏭  baile-fola already exists — nothing to do.')
    return
  }

  const world = await db.query.worldsTable.findFirst({
    where: eq(worldsTable.slug, 'treigthe'),
  })
  if (!world)
    throw new Error('Tréigthe world not seeded. Run treigthe.ts first.')

  const region = await db.query.regionsTable.findFirst({
    where: and(
      eq(regionsTable.worldId, world.id),
      eq(regionsTable.name, 'Talamh Liath')
    ),
  })
  if (!region) throw new Error('Talamh Liath region not found.')

  // ── LOCATION ──────────────────────────────────────────────────────────────

  const [baileFola] = await db
    .insert(locationsTable)
    .values({
      regionId: region.id,
      name: 'Baile Fola',
      nameTranslation: 'Town of Blood',
      slug: 'baile-fola',
      locationType: 'city',
      sceneTag: 'port',
      promptContext: `Baile Fola — the southern port (~12,000 people). Named for the slaughterhouses that fed the city through the Grey Fever, not for any battle. Where Cathair Luaith has the Church, Baile Fola has the guilds: the Salt Guild, the Ropemakers, and the Coopers hold the harbour between them, and the Church keeps one small chapel here that nobody visits.

Everything smells of brine, fish blood and tar. Timber quays, black water, gulls that have learned not to fear people. The Church's writ runs thin this far south — a Bleeder can work here in the open, for a price, and nobody reports it. Guild law is the only law: debts are enforced, and the enforcement is visible on the quayside if you look.

No ship has sailed north past Na Sléibhte Dubha in three months. The captains do not explain why. They simply refuse the charter.`,
      currentEvents: `The Salt Guild has doubled its prices without explanation and is buying every barrel it can find. Two Church envoys arrived from Cathair Luaith a fortnight ago and have not gone home. Fishermen report the water going still in the bay before each earthquake — a flat, oily calm that arrives minutes ahead of the shaking, and the gulls leave first.`,
      history: `Founded Year 40 as a fishing village. Grew on salt and rope. During the Grey Fever (Year 89) the town slaughtered every animal it had to feed the survivors, and took the name Baile Fola afterwards — a name chosen, not given. The guilds formed in Year 150 to keep the Church out of the harbour, and have kept it out since.`,
      isActive: true,
    })
    .returning()

  console.log(`✓ Location: ${baileFola.name}`)

  // ── SUB-LOCATIONS ─────────────────────────────────────────────────────────

  const [saltHouse] = await db
    .insert(subLocationsTable)
    .values({
      locationId: baileFola.id,
      name: 'Teach an tSalainn',
      nameTranslation: 'The Salt House',
      description:
        'The Salt Guild hall on the eastern quay. Whitewashed, windowless on the seaward side. The guild weighs, prices and licenses every grain of salt that leaves Talamh Liath.',
      atmosphere:
        'Dry air that cracks the lips. Salt dust on every surface, in the throat, in the eyes. Ledgers, and the sound of a scale settling.',
      promptContext:
        'The Salt Guild controls preservation, and preservation is power in a land that cannot trust its harvests. The guild masters are civil, exact, and entirely without mercy about debt. Salt is also the only thing common folk trust against the echo — they carry it in pouches — so the guild sells fear as well as seasoning.',
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: saltHouse.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['bleeder'],
      content:
        'The Salt Guild buys blood-clean salt at four times the standard rate, no questions asked about the source. They will not say what it is for. The order comes from Cathair Luaith and has doubled twice this year.',
    },
    {
      subLocationId: saltHouse.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'The Church is buying the salt through the guild. It is being shipped inland toward Tuama na nDéithe — an enormous quantity, far past any use for preservation. The Church is trying to pack something. It is not working.',
    },
  ])

  const [drownedGull] = await db
    .insert(subLocationsTable)
    .values({
      locationId: baileFola.id,
      name: 'An Faoileán Báite',
      nameTranslation: 'The Drowned Gull',
      description:
        'A tavern built on the pilings at the end of the western quay, half over the water. The floor moves with the tide. Favoured by crews who have been refused a charter.',
      atmosphere:
        'The floor shifts underfoot. Wet rope, spilled ale, the smell of the bay coming up through the boards. Low ceiling. Everyone sits facing the door.',
      promptContext:
        'Where you find people who need to leave and cannot. Captains drink here between refused charters. If anyone in Talamh Liath knows what is happening in the northern waters, they are in this room and they are not sober.',
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: drownedGull.id,
      tier: 'tier_1',
      applicableRaces: ['duskborn'],
      applicableClasses: null,
      content:
        'Duskborn drink here without trouble. The crews are too superstitious to insult anything that might be older than the town, and too tired to care.',
    },
  ])

  console.log('✓ Sub-locations: Salt House, Drowned Gull')

  // ── NPCs ──────────────────────────────────────────────────────────────────
  // primaryLocationId is what makes the cast change when the player moves.
  // These two must NOT appear while the player is in Cathair Luaith.

  const [brighidNiChonaill] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: baileFola.id,
      name: 'Bríghid Ní Chonaill',
      portraitUrl: '/images/fantasy/treigthe/npcs/brighid-ni-chonaill.webp',
      title: 'Mistress of the Salt Guild',
      role: 'faction_leader',
      race: 'scarred',
      age: 54,
      appearance:
        'Broad, sun-cracked, forearms like a dockhand. Wears no guild finery — a working apron and a knife she has clearly used. Hands permanently white with salt.',
      personality:
        'Blunt, transactional, unbothered. Treats every conversation as a negotiation and says so out loud. Laughs easily and it means nothing.',
      motivation:
        'Keep the Church out of her harbour. She has held that line for nineteen years and she is aware she is currently losing it.',
      secret:
        'She knows the salt is going to Tuama na nDéithe, because she looked. She has kept the contract anyway — the money is keeping the guild alive, and she has told herself she does not need to know. She has begun to need to know.',
      relationships: {
        'Ciarán Mór':
          'Never met him. Deals with his envoys. Hates the arrangement and honours it.',
        'Cormac Rua': 'Useful. Watched. Not trusted, and he knows it.',
      },
      promptContext:
        'Bríghid Ní Chonaill — Mistress of the Salt Guild, 54, Scarred. Blunt and transactional. Runs the harbour. Selling enormous quantities of salt to the Church and has stopped asking why, which is beginning to cost her sleep.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: brighidNiChonaill.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['bleeder'],
      content:
        'She will trade with Bleeders openly, and price them fairly. Her only rule is that the work happens outside the Salt House — not from squeamishness, but because salt and the echo do not mix and she will not risk the stock.',
    },
    {
      npcId: brighidNiChonaill.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'She has the shipping manifests. They show the destination. She has not burned them, which tells you what she intends to do eventually.',
    },
  ])

  const [cormacRua] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: baileFola.id,
      name: 'Cormac Rua',
      portraitUrl: '/images/fantasy/treigthe/npcs/cormac-rua.webp',
      title: null,
      role: 'npc_major',
      race: 'scarred',
      age: 31,
      appearance:
        'Red-bearded, wiry, a coastal sailor gone landbound. Salt-stained coat he has not replaced. Watches the northern horizon while he talks to you.',
      personality:
        'Talks too much and too fast, and has been drinking since the spring. Frightened, and cannot say of what without sounding mad.',
      motivation:
        'Get someone — anyone — to believe him about the northern water, so that he can stop being the only one who knows.',
      secret:
        'He sailed north past the mountains four months ago and turned back. He saw the sea flat and unmoving over the deep water, as if something beneath it had stopped the tide. He has not sailed since. Two other captains saw it. One has since drowned in the harbour, in calm weather.',
      relationships: {
        'Bríghid Ní Chonaill':
          'She lets him drink on credit. He thinks this is kindness.',
      },
      promptContext:
        'Cormac Rua — 31, Scarred, a captain who no longer sails. Drinks at the Drowned Gull. Talks too much. Saw something in the northern water four months ago and has not been believed, and is beginning to prefer being thought a drunk to being thought a liar.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: cormacRua.id,
      tier: 'tier_1',
      applicableRaces: ['duskborn'],
      applicableClasses: null,
      content:
        'He will talk to a Duskborn where he would not talk to a Scarred — he has decided that something that old will not laugh at him.',
    },
  ])

  console.log('✓ NPCs: Bríghid Ní Chonaill, Cormac Rua')
  console.log('\n✅ Baile Fola seeded.')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

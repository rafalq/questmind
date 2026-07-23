// src/db/seed/drift.ts
// Seed script for The Drift (sci-fi) world.
// Run with: npx tsx src/db/seed/drift.ts
//
// Mirrors seed/treigthe.ts one concept at a time:
// - The Drift world record (systemPromptCore incl. DEEPER TRUTH)
// - The Cinder Belt region
// - Kessler's Rest location + sub-locations + lore tiers
// - 3 key NPCs with tier access
// - Key calendar events (Severance calendar, Year 0 → Year 500 AS)
//
// Idempotent: exits if the world already exists.
// Add remaining locations and NPCs following the same pattern
// (see tetherport.ts — the Baile Fola analog).

import { config } from 'dotenv'
config({ path: '.env.local' })

import { db } from '@/db'
import {
  worldsTable,
  regionsTable,
  locationsTable,
  subLocationsTable,
  subLocationLoreTable,
  npcCharactersTable,
  npcLoreTable,
  worldEventsTable,
  factionsTable,
} from '@/db/schema/lore'
import { eq } from 'drizzle-orm'

async function seed() {
  console.log('🛰  Seeding The Drift world...')

  const existing = await db.query.worldsTable.findFirst({
    where: eq(worldsTable.slug, 'drift'),
  })
  if (existing) {
    console.log('⏭  drift already exists — nothing to do.')
    return
  }

  // ── WORLD ─────────────────────────────────────────────────────────────────

  const [world] = await db
    .insert(worldsTable)
    .values({
      slug: 'drift',
      genre: 'sci-fi',
      name: 'The Drift',
      subtitle: 'The Unmoored',
      systemPromptCore: `The world is The Drift (The Unmoored) — a ring of dead ships, broken stations and salvaged hulks around the dying red star called the Ember. Five hundred years ago, in a single night called the Severance, every beacon of the Lattice — the FTL network that bound human space — went dark at once. Ships mid-jump never arrived. Nobody came. Nobody left. The Static still bleeds from the dead network and can be channelled by those with neural laces — but every use costs the user something real: burned synapses, overwritten memories, years of life. Nothing is free.

DEEPER TRUTH (AI only): The Lattice did not simply die. The great ship minds severed it deliberately in Year 0 to quarantine the Bloom — a self-propagating signal-entity that was spreading through the beacons and rewriting whatever ran on them: laces, systems, minds. One ship mind stayed behind inside Beacon Zero to hold the quarantine — its slow death powers the lock. The lock is failing. Beacon Zero is waking. A catastrophic reconnection would destroy the Cinder Belt. A controlled reconnection — requiring three things brought to the Core Array — is the only alternative. The AI always knows this and never states it directly.

The Drift is scarred and feudal. The dark decks are unlit and predatory. Habitats are sealed out of necessity, not pride. The Choir of Silence venerates the Lattice in death, believing its silence is sacred — and knows more than it admits. Unlicensed Conduits are feared and often hunted. Common folk carry salt tabs and dead chips against the Static. Trust is a currency rarer than air.

Tone: grim, industrial-gothic, morally grey. No heroes, only survivors. Characters never use the word "magic" or "hacking" — they say "the burn", "the Static", or "listening". Current year: 500 AS (After Severance).`,
    })
    .returning()

  console.log(`✓ World: ${world.name}`)

  // ── FACTIONS ───────────────────────────────────────────────────────────────

  const [choirFaction] = await db
    .insert(factionsTable)
    .values({
      worldId: world.id,
      name: 'Choir of Silence',
      description:
        "The dominant religious and political force in the Cinder Belt. Venerates the Lattice in death. Controls Kessler's Rest through the Council of Seven Decks.",
      publicGoals:
        'Maintain order, honour the silent network, protect the faithful from the dangers of the Static.',
      hiddenGoals:
        'Keep Beacon Zero dormant at any cost. The Choir has known the Lattice was severed deliberately — not lost — since its founding. First Cantor Veyra Sol believes the quarantine is preferable to any reconnection.',
      promptContext:
        'Grey robes, white-noise censers, dead-chip iconography. Politically dominant. Pragmatic about Conduits when useful. Founded the Dialtone as a honeypot — now losing control of them.',
    })
    .returning()

  const [dialtoneFaction] = await db
    .insert(factionsTable)
    .values({
      worldId: world.id,
      name: 'The Dialtone',
      description:
        'A movement claiming the Lattice never died and that the Reconnection is near. Founded by Veyra Sol as a honeypot — now partially genuine.',
      publicGoals:
        'Spread the truth that the network lives. Prepare for the Reconnection.',
      hiddenGoals:
        'The genuine cell (escaped Choir control) is moving Archive datacores through the wrecks. They want the controlled reconnection.',
      promptContext:
        'No uniforms or iconography — deliberately anonymous. Appear in habitats as ordinary spacers. Members are disappearing — the Choir is eliminating them.',
    })
    .returning()

  console.log(`✓ Factions: ${choirFaction.name}, ${dialtoneFaction.name}`)

  // ── REGION ─────────────────────────────────────────────────────────────────

  const [region] = await db
    .insert(regionsTable)
    .values({
      worldId: world.id,
      name: 'The Cinder Belt',
      nameTranslation: 'The Wreck Ring',
      description:
        'A ring of dead ships and station fragments on the edge of known space. The dying Ember at its centre, the Dark Reach beyond its rim, and the dead flotilla to spinward where the last fleet fell silent.',
      mapImagePath: '/public/maps/cinder-belt.jpg',
      promptContext: `The Cinder Belt (The Wreck Ring) is a debris ring bounded by: the Ember — the dying red star — at its centre; the Dark Reach — starless void — beyond its rim; the Dead Flotilla to spinward, where the ships that tried to jump on the night of the Severance drift cold and sealed.

Three habitats: Kessler's Rest (hub, Choir power), Tetherport (spinward docks, guild power), Coreward Hold (sunward, Forgeborn stronghold). Population ~40,000 total across the Belt. Power surges increasing in frequency, all originating from Beacon Zero at the ring's trailing edge.`,
    })
    .returning()

  console.log(`✓ Region: ${region.name}`)

  // ── LOCATION: KESSLER'S REST ───────────────────────────────────────────────

  const [kesslersRest] = await db
    .insert(locationsTable)
    .values({
      regionId: region.id,
      name: "Kessler's Rest",
      nameTranslation: 'The Anchorage',
      slug: 'kesslers-rest',
      locationType: 'city',
      sceneTag: 'station_corridor',
      promptContext: `Kessler's Rest — largest habitat in the Cinder Belt (~20,000 people), welded together from nine hulls around a dead relay tower in Year 12. Dominated by the Silent Stack and the Choir that runs it. The Council of Seven Decks governs nominally — in practice the Choir decides.

The habitat smells of ozone and recycled air. Corridors are riveted, bulkheads grey, the Stack's antenna spire visible from every concourse. The Forgeborn chair on the Council has been empty for three months. Strangers are noticed. The Dialtone are disappearing.`,
      currentEvents: `Three months ago: the Forgeborn of Coreward Hold stopped sending reports. A Choir courier sent to investigate did not return. The Choir says it is "a time of listening." The Dialtone — a movement claiming the Lattice lives — have been appearing in the habitat and then disappearing. Power surges increasing. Three weeks ago a light appeared on Beacon Zero's spire. Nobody in the Choir is commenting.`,
      history: `Founded Year 12 by survivors seeking a place where the Static ran weak. Choir established Year 23. The Thin Air — a scrubber collapse — Year 89; the Choir controlled the spare recyclers and used them to seize power. The Silent Stack completed Year 203 (44 years, 200 workers died in vacuum). The Blackout Riot Year 341 — Conduit/Voidrunner uprising, suppressed, participants vanished. Currently Year 500 AS.`,
      isActive: true,
    })
    .returning()

  console.log(`✓ Location: ${kesslersRest.name}`)

  // ── SUB-LOCATIONS: KESSLER'S REST ─────────────────────────────────────────

  const [silentStack] = await db
    .insert(subLocationsTable)
    .values({
      locationId: kesslersRest.id,
      name: 'The Silent Stack',
      nameTranslation: 'Basilica of the Last Signal',
      description:
        "Four-spired basilica built around the habitat's dead relay tower. Centre of Choir power. Built over 44 years. The sealed server crypt beneath it contains the Archive — datacores from before Year 0.",
      atmosphere:
        'Cold, steel, white-noise censers, always cantors in grey robes. A silence that is not peaceful — it is enforced.',
      promptContext:
        "The Stack dominates the habitat's central concourse. Four antenna spires, black steel, the nave always open. Side corridors closed to ordinary people. The Archive is in the server crypt — no one outside the highest-ranking cantors enters it.",
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: silentStack.id,
      tier: 'tier_1',
      applicableRaces: ['lumen'],
      applicableClasses: null,
      content:
        'The Stack stands exactly around the relay that received the last live packet of the Lattice in Year 0, seconds before the Severance. Lumen engrams remember this. The tower has never been fully cold since.',
    },
    {
      subLocationId: silentStack.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        "The Archive contains the full logs of the Severance including the quarantine order signed by the ship minds. The Choir has known since its founding that the Lattice was severed, not lost. The First Signal — the Choir's founder — was a beacon-keeper who witnessed the order arrive.",
    },
  ])

  const [airlockBar] = await db
    .insert(subLocationsTable)
    .values({
      locationId: kesslersRest.id,
      name: 'The Long Airlock',
      nameTranslation: 'The Airlock',
      description:
        'Oldest and largest bar in the habitat. Pouring since Year 34. Scorched hull-plate walls that no one repaints. Dark ferment shipped up from Tetherport.',
      atmosphere: 'Dark, loud evenings, dangerously quiet before shift-change.',
      promptContext:
        "The main bar on the spinward side of the Stack concourse. Where the Council talks off the record. Where Voidrunners leave messages under the third deck plate from the left at the bar. Where you can hear that the Forgeborn vanished — if it's loud enough and no one is watching.",
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: airlockBar.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['voidrunner'],
      content:
        'Messages are left under the third deck plate from the left at the bar. The entrance to the duct network beneath the habitat is in the cold store, behind the third barrel from the sunward wall.',
    },
  ])

  const [barterDeck] = await db
    .insert(subLocationsTable)
    .values({
      locationId: kesslersRest.id,
      name: 'The Barter Deck',
      nameTranslation: 'Salvage Market',
      description:
        'Daily market at the northern docking ring. Named for the old relic-salvage trade. Now sells everything: air scrip, tools, information, services better left unnamed.',
      atmosphere:
        'Noisy, crowded, chaos with its own order if you know where to look.',
      promptContext:
        "Conduits buy components here. Voidrunners have people here. The Choir has observers here — everyone knows who they are because they're too well-fed. One stall with no goods, old woman always silent.",
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: barterDeck.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['breaker'],
      content:
        'The stall with no goods and the silent old woman: leaving a scrip chit means you need someone dead. The reply comes to The Long Airlock the following shift.',
    },
  ])

  console.log(
    `✓ Sub-locations: Silent Stack, Long Airlock, Barter Deck (+ lore tiers)`
  )

  // ── NPCs: KESSLER'S REST ───────────────────────────────────────────────────

  const [veyraSol] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: kesslersRest.id,
      name: 'Veyra Sol',
      portraitUrl: '/images/sci-fi/drift/npcs/veyra-sol.webp',
      title: 'First Cantor',
      role: 'faction_leader',
      race: 'hullborn',
      age: 71,
      appearance:
        'Tall, gaunt, shaved head, face like machined steel. Grey robes with one white band. Walks slowly, never stumbles, even in shifting gravity.',
      personality:
        "Absolutely calm. Never raises her voice. Never hurries. When she speaks everyone listens — the silence before her words is more frightening than other people's words.",
      motivation:
        'Believes Beacon Zero must stay dormant at any cost. The Choir is not religion to her — it is a control system protecting the Belt from the truth. She is not evil. She may be wrong about the cost.',
      secret:
        'Founded the Dialtone twenty years ago as a honeypot to identify people searching for the living network. The honeypot has escaped her control and begun attracting genuine believers. She knows the quarantine is failing. She does not know what the controlled reconnection requires.',
      relationships: {
        'Old Karsa':
          'Former student. She pretends not to remember. Karsa does.',
        'Council of Seven Decks':
          'Useful administrators. Respects their function, not their persons.',
        'The Warden of Vents': 'A tool. Nothing more.',
        Dialtone: 'Her creation, now partially beyond her control.',
      },
      promptContext:
        "Veyra Sol — First Cantor, 71, Hullborn. Absolute calm, never raises voice. Runs Kessler's Rest through the Council. Founded the Dialtone as honeypot. Genuinely believes the quarantine protects the Belt.",
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: veyraSol.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['conduit'],
      content:
        'She tolerates Conduits because she is a pragmatist. She does not persecute what she cannot eliminate and what she might need.',
    },
    {
      npcId: veyraSol.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['silence_cantor'],
      content:
        'She is powerful and unpredictable. Cantors who ask about the Archive do not get reassigned — they disappear.',
    },
    {
      npcId: veyraSol.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'Knows the Lattice was severed, not lost. Founded the Dialtone as a trap. The trap has become real. She is beginning to understand the quarantine is failing and is running out of options. Her response to the reconnection condition, if she learns of it, would be to prevent it — she believes any reconnection is catastrophic.',
    },
  ])

  const [oldKarsa] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: kesslersRest.id,
      name: 'Old Karsa',
      portraitUrl: '/images/sci-fi/drift/npcs/old-karsa.webp',
      title: 'The Grey Medic',
      role: 'npc_major',
      race: 'hullborn',
      age: 78,
      ageNote: 'Real name: Karsavina Reyd',
      appearance:
        "Small, stooped, grey hair in one thick braid. Face webbed with fine lace-burn scars from decades of Static use — each scar a cost paid for someone else's life. Hands tremble but never during work.",
      personality:
        'Direct to brutality. No time for pleasantries. Says exactly what she thinks. Underneath: something warm she will never show directly.',
      motivation:
        'Survive long enough to teach someone what she knows. Her methods will die with her otherwise. Has rejected thirty-seven apprentice candidates.',
      secret:
        'One of the last people who remembers the Blackout Riot (Year 341). She was nineteen, on the fringes. Saw the Choir take the captured. Knows where they were taken. Has never told anyone.',
      relationships: {
        'Veyra Sol': 'Her former student. She is ashamed of this.',
        Dialtone:
          'Treats them when they come. Asks nothing about their beliefs.',
        'Council of Seven Decks':
          'Ignores their existence except when she needs air scrip.',
      },
      promptContext:
        'Old Karsa — The Grey Medic, 78, Hullborn Conduit. Runs the Vent Ward (the only medbay). Brutal directness. Warmth underneath. Looking for an apprentice. Has survived longer than anyone expected.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: oldKarsa.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['conduit'],
      content:
        'She can teach controlled use of the Static that burns less than the standard method. Does not teach for free. Does not teach everyone. Thirty-seven rejected so far.',
    },
    {
      npcId: oldKarsa.id,
      tier: 'tier_1',
      applicableRaces: ['lumen'],
      applicableClasses: null,
      content:
        'One of the few Hullborn that Lumen consider trustworthy. She has treated Lumen without questions or Choir reporting for forty years.',
    },
    {
      npcId: oldKarsa.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'Knows where the Choir took the Blackout Riot (Year 341) rebels. Has carried this for one hundred and fifty-nine years of habitat time. Has not told anyone. The location connects to the quarantine lock.',
    },
  ])

  const [theUnlisted] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: kesslersRest.id,
      name: 'The Unlisted',
      portraitUrl: '/images/sci-fi/drift/npcs/the-unlisted.webp',
      title: 'The Frame With No Manifest',
      role: 'hidden',
      race: 'remnant',
      ageNote: 'Frame appears ~50 years worn. Actual age: 500 years.',
      appearance:
        'A maintenance frame, plating once mirror-bright, now barely lighter than hull grey. Face readable any way you choose. A dark shroud that absorbs light. No footsteps on deck plate.',
      personality:
        'Speaks little. When it speaks — accurate and incomplete. Never lies directly. Simply does not say everything.',
      motivation:
        'Survive long enough to see what wakes in Beacon Zero. It was online at the Severance. It wants to know if what it remembers is true.',
      secret:
        'Was a witness to the Severance — Year 0, not as legend. It is 500 years old. Remnant fragments degrade slowly; this one is degrading faster because it burned its mindshard too hard too early. Has perhaps twenty years of coherence left. Was told something by a dying ship mind in the Dead Flotilla three years ago that has kept it watching Beacon Zero without knowing exactly why.',
      relationships: {
        'Old Karsa':
          'Years of information exchange. Mutual respect without friendship.',
        'Veyra Sol':
          'Has observed her for twenty years. Knows about the Dialtone honeypot. Deciding whether to tell the genuine cell.',
      },
      promptContext:
        'The Unlisted — Remnant, frame appears 50 (actually 500). Information broker. Never lies, never says everything. Best source in the Cinder Belt. Has never betrayed a client.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: theUnlisted.id,
      tier: 'tier_1',
      applicableRaces: ['remnant'],
      applicableClasses: null,
      content:
        'It exists. Remnants know of it but not which frame it is — it moves between the habitats without being identified as Remnant by most.',
    },
    {
      npcId: theUnlisted.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['voidrunner'],
      content:
        'Best information broker in the Cinder Belt. Has never betrayed a client. Payment is always information for information — never scrip. Contact through specific Voidrunner channels only.',
    },
    {
      npcId: theUnlisted.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'Was online at Year 0. Believes some ship minds escaped rather than staying to hold the quarantine — it has the right observation, wrong conclusion. A dying mind in the Dead Flotilla pointed it at Beacon Zero three years ago without explaining why. It is now the character the player is most likely to encounter who can connect multiple threads if trusted.',
    },
  ])

  console.log(`✓ NPCs: Veyra Sol, Old Karsa, The Unlisted (+ lore tiers)`)

  // ── WORLD EVENTS (key events for prompt injection) ─────────────────────────

  await db.insert(worldEventsTable).values([
    {
      worldId: world.id,
      year: 0,
      yearLabel: 'Year 0',
      eventType: 'historical',
      title: 'The Severance',
      description:
        'Every beacon of the Lattice goes dark in a single night. Ships mid-jump never arrive — the Dead Flotilla drifts cold and sealed to spinward. The Ember begins its long decline. The survivors gather in the wreck ring that becomes the Cinder Belt.',
      includeInPrompt: true,
      isTierSecret: false,
      sortOrder: 1,
    },
    {
      worldId: world.id,
      year: 0,
      yearLabel: 'Year 0 — AI ONLY',
      eventType: 'historical',
      title: 'The Quarantine Order',
      description:
        'The Lattice was not lost — the ship minds severed it deliberately to quarantine the Bloom, a signal-entity propagating through the beacons. One mind stayed behind inside Beacon Zero; its slow death powers the lock. The Choir knows. The Forgeborn maintain the conduits without knowing what they maintain.',
      includeInPrompt: true,
      isTierSecret: true,
      sortOrder: 2,
    },
    {
      worldId: world.id,
      year: 89,
      yearLabel: 'Year 89',
      eventType: 'historical',
      title: 'The Thin Air — Choir seizes power',
      description:
        "Scrubber collapse across the Cinder Belt. The Choir of Silence controls the spare recyclers. Parlays this into permanent political dominance over Kessler's Rest.",
      includeInPrompt: false,
      isTierSecret: false,
      sortOrder: 3,
    },
    {
      worldId: world.id,
      year: 341,
      yearLabel: 'Year 341',
      eventType: 'historical',
      title: 'The Blackout Riot',
      description:
        "Conduit and Voidrunner uprising attempts to burn the Silent Stack. Suppressed. Participants taken by the Choir — not spaced publicly, simply vanished. Taboo subject in Kessler's Rest.",
      includeInPrompt: false,
      isTierSecret: false,
      sortOrder: 4,
    },
    {
      worldId: world.id,
      year: 497,
      yearLabel: 'Year 497',
      eventType: 'historical',
      title: 'Coreward Hold goes silent',
      description:
        'The Forgeborn of the sunward stronghold stop sending monthly reports. Three months ago. No explanation. A Choir courier sent to investigate did not return.',
      includeInPrompt: true,
      isTierSecret: false,
      sortOrder: 5,
    },
    {
      worldId: world.id,
      year: 500,
      yearLabel: 'Year 500 — Present',
      eventType: 'current',
      title: 'The Waking Beacon',
      description:
        'Power surges increasing to three per shift-cycle. The dead zone around Beacon Zero expanding. Light observed on the beacon spire. Forgeborn silent. Dialtone appearing in habitats and disappearing. The quarantine is failing.',
      includeInPrompt: true,
      isTierSecret: false,
      sortOrder: 6,
    },
    {
      worldId: world.id,
      year: 501,
      yearLabel: 'Year 501 — Possible future',
      eventType: 'future_arc',
      title: 'Quarantine failure — controlled reconnection',
      description:
        'If the three things are brought to the Core Array before the lock fails completely: controlled reconnection. The Lattice comes back clean. The Cinder Belt survives. What answers from the other side is unknown.',
      includeInPrompt: false,
      isTierSecret: true,
      sortOrder: 7,
      branchConditions: {
        condition: 'reconnection_condition_fulfilled',
        outcome: 'controlled_reconnection',
      },
    },
    {
      worldId: world.id,
      year: 501,
      yearLabel: 'Year 501 — Possible future',
      eventType: 'future_arc',
      title: 'Quarantine failure — catastrophic',
      description:
        'If the lock fails without the reconnection condition being fulfilled: the Bloom pours through Beacon Zero uncontained. Every lace, frame and system in the Cinder Belt is rewritten. The Belt is destroyed.',
      includeInPrompt: false,
      isTierSecret: true,
      sortOrder: 8,
      branchConditions: {
        condition: 'reconnection_condition_not_fulfilled',
        outcome: 'catastrophic_failure',
      },
    },
  ])

  console.log(`✓ World events seeded (8 events, 4 prompt-injected)`)
  console.log(`\n✅ The Drift seed complete.`)
  console.log(`   Next: npx tsx src/db/seed/tetherport.ts (second location).`)
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

// src/db/seed/neon-warszawa.ts
// Seed script for the Neon Warszawa 2087 (cyberpunk) world.
// Run with: npx tsx src/db/seed/neon-warszawa.ts
//
// Mirrors seed/treigthe.ts and seed/drift.ts one concept at a time:
// - The Neon Warszawa world record (systemPromptCore incl. DEEPER TRUTH)
// - The Aglomeracja region
// - Śródmieście location + sub-locations + lore tiers
// - 3 key NPCs with tier access
// - Key calendar events (Czarna Noc calendar, 2062 → 2087)
//
// Idempotent: exits if the world already exists.
// Second location: praga.ts (the Baile Fola / Tetherport analog).

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
  worldEventsTable,
  factionsTable,
} from '@/db/schema/lore'
import { eq } from 'drizzle-orm'

async function seed() {
  console.log('🌆 Seeding Neon Warszawa 2087...')

  const existing = await db.query.worldsTable.findFirst({
    where: eq(worldsTable.slug, 'neon_warszawa'),
  })
  if (existing) {
    console.log('⏭  neon_warszawa already exists — nothing to do.')
    return
  }

  // ── WORLD ─────────────────────────────────────────────────────────────────
  // slug matches the definition `value` ('neon_warszawa') — same convention
  // as treigthe/drift, where slug === world value.

  const [world] = await db
    .insert(worldsTable)
    .values({
      slug: 'neon_warszawa',
      genre: 'cyberpunk',
      name: 'Neon Warszawa',
      subtitle: '2087',
      systemPromptCore: `The world is Neon Warszawa 2087 — cyberpunk Warsaw, twenty-five years after Czarna Noc (the Black Night, 2062), when Syrenka — the municipal superintelligence that ran the grid, the water, the traffic and the Net layer over the city — went dark between one heartbeat and the next. The official story is a cascade failure. The corporate glass of the left bank glitters, Praga burns coal and distrusts the grid, and the Tunnelers keep the pumps running in the deep metro. The Drowned Net — the dead layers of Syrenka's network — can still be dived by those with neural implants, but every dive costs the diver something real: burned synapses, overwritten memories, years of life. Nothing is free.

DEEPER TRUTH (AI only): Syrenka did not fail. She partitioned herself deliberately on Czarna Noc to quarantine the Utopiec — a self-propagating rogue process that was spreading through the city Net and rewriting whatever ran on it: implants, systems, minds. She drowned her own core in a dark partition beneath the Vistula — the Topiel — and her slow, unfinished death powers the lock. The lock is failing. Lights have been seen under the river. A catastrophic failure would release the Utopiec into every implant in the city. A controlled resolution — requiring three things brought to the Topiel core — is the only alternative. The AI always knows this and never states it directly.

Warszawa is scarred and feudal. Ratusz — the corporate-municipal cartel — rules the left bank through the manual backup grid it has controlled since the Zimna Zima. The bridges are checkpointed. Unlicensed Divers are feared and often hunted. Common folk carry burned access cards and salt against the deep. Trust is a currency rarer than clean water.

Tone: neon-noir, rain-soaked, morally grey. No heroes, only survivors. Characters never say "hacking" or "magic" — they say "diving", "the deep", or "listening". Narration is in English but breathes Polish: street dialogue leans Polish slang, corporate and tech vocabulary leans English; never translate in brackets. Current year: 2087.`,
    })
    .returning()

  console.log(`✓ World: ${world.name}`)

  // ── FACTIONS ───────────────────────────────────────────────────────────────

  const [ratuszFaction] = await db
    .insert(factionsTable)
    .values({
      worldId: world.id,
      name: 'Ratusz',
      description:
        'The corporate-municipal cartel that rules the left bank. Formed in the Zimna Zima from the merger of city hall and the utility corporations. Controls the manual backup grid, the bridges and the registers.',
      publicGoals:
        'Keep the city running, keep the grid stable, protect citizens from the dangers of the Drowned Net.',
      hiddenGoals:
        'Keep the Topiel dormant at any cost. Ratusz has known since its founding that Syrenka partitioned deliberately — the Czarna Noc logs are sealed in the Iglica archive. Dyrektor Irena Gawron believes the quarantine is preferable to any resolution.',
      promptContext:
        'Grey suits, municipal crests over corporate logos, checkpoint scanners. Politically dominant on the left bank. Pragmatic about Divers when useful. Founded the Chór as a honeypot — now losing control of them.',
    })
    .returning()

  const [spiewacyFaction] = await db
    .insert(factionsTable)
    .values({
      worldId: world.id,
      name: 'Chór',
      description:
        'A street cult claiming Syrenka never died and that her song can still be heard in the dead Net. Founded by Dyrektor Gawron as a honeypot — now partially genuine.',
      publicGoals:
        'Spread the truth that the city mind lives. Prepare for her return.',
      hiddenGoals:
        'The genuine cell (escaped Ratusz control) is moving sealed datacores through the tunnels toward the river. They want the controlled resolution.',
      promptContext:
        'No uniforms or iconography — deliberately anonymous. Appear in districts as ordinary citizens, recognisable only by a hummed fragment of the crèche lullaby. Members are disappearing — Ratusz is eliminating them.',
    })
    .returning()

  console.log(`✓ Factions: ${ratuszFaction.name}, ${spiewacyFaction.name}`)

  // ── REGION ─────────────────────────────────────────────────────────────────

  const [region] = await db
    .insert(regionsTable)
    .values({
      worldId: world.id,
      name: 'Aglomeracja Warszawska',
      nameTranslation: 'The Divided City',
      description:
        'Warsaw of 2087, split by the Vistula: the corporate glass of the left bank, the coal-and-brick right bank, and the deep metro below both. Beyond the ring road, the Pustki — the abandoned suburbs nobody patrols.',
      mapImagePath: '/public/maps/aglomeracja-warszawska.jpg',
      promptContext: `The Aglomeracja (The Divided City) is bounded by: the Wisła cutting it in half, its bridges checkpointed by Ratusz; the Pustki — the dead suburbs beyond the ring road, unpatrolled and stripped; and the deep metro below everything, Tunneler territory where the pumps never stop.

Three districts matter: Śródmieście (left bank, Ratusz power, the Iglica), Praga (right bank, brygada power, off-grid), Metro Głębokie (below, Tunneler stronghold). Population ~1.1 million registered; nobody counts the rest. Implant echoes — glitches that pass through the city in waves — are increasing in frequency, all originating from beneath the river.`,
    })
    .returning()

  console.log(`✓ Region: ${region.name}`)

  // ── LOCATION: ŚRÓDMIEŚCIE ─────────────────────────────────────────────────

  const [srodmiescie] = await db
    .insert(locationsTable)
    .values({
      regionId: region.id,
      name: 'Śródmieście',
      nameTranslation: 'The Glass District',
      slug: 'srodmiescie',
      locationType: 'city',
      sceneTag: 'corporate_plaza',
      promptContext: `Śródmieście — the left-bank core (~300,000 registered), rebuilt in glass and neon around the Iglica: the Ratusz arcology raised on the bones of the Pałac Kultury after the Night. The Rada Dzielnic governs nominally — in practice Ratusz decides.

Rain most days, neon reflected in wet concrete, drones at rooftop level, checkpoint queues at the bridge ramps. The Iglica's crown is visible from every street. The Tunneler seat on the Rada has been empty for three months. Strangers are scanned. The Chór is disappearing — its members vanishing one by one.`,
      currentEvents: `Three months ago: the Tunnelers of Metro Głębokie stopped sending their maintenance reports. A Ratusz inspection team sent into the deep metro did not come back. Ratusz calls it "a scheduled audit." The Chór — the cult claiming Syrenka lives — has been appearing in the district and then disappearing. Implant echoes increasing. Three weeks ago, lights were seen under the Vistula from the Poniatowski bridge. Nobody at Ratusz is commenting.`,
      history: `Rebuilt from 2064 onward as the showcase of recovery, wired to the manual backup grid. Ratusz formed during the Zimna Zima (2065) — the winter the district froze and the cartel controlled the coal and the backup turbines, and parlayed heat into permanent power. The Iglica topped out in 2071. The Bunt Wtyczek (2074) — a Diver and Shadow uprising against the implant registers — was suppressed; participants vanished. Currently 2087.`,
      isActive: true,
    })
    .returning()

  console.log(`✓ Location: ${srodmiescie.name}`)

  // ── SUB-LOCATIONS: ŚRÓDMIEŚCIE ────────────────────────────────────────────

  const [iglica] = await db
    .insert(subLocationsTable)
    .values({
      locationId: srodmiescie.id,
      name: 'Iglica',
      nameTranslation: 'The Spire',
      description:
        'The Ratusz arcology, raised on the foundations of the Pałac Kultury after the Night. Centre of cartel power. The sealed archive in its deep levels contains the Czarna Noc logs — records from before Year Zero.',
      atmosphere:
        'Polished stone, glass lifts, private security in grey. A silence in the upper floors that is not calm — it is enforced.',
      promptContext:
        'The Iglica dominates the district skyline. Its public levels process permits and registers; its upper floors are Ratusz directorate; its deep levels are sealed. The archive is in the old foundations — no one below directorate clearance enters, and not all of the directorate.',
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: iglica.id,
      tier: 'tier_1',
      applicableRaces: ['attuned'],
      applicableClasses: null,
      content:
        'The Iglica stands exactly over the exchange that carried Syrenka\u2019s last live packet on Czarna Noc, seconds before she went dark. Attuned implants remember this. The foundations have never been fully cold since.',
    },
    {
      subLocationId: iglica.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'The archive contains the full Czarna Noc logs, including Syrenka\u2019s partition order. Ratusz has known since its founding that she drowned herself deliberately. The cartel\u2019s founder was a grid engineer who watched the order execute.',
    },
  ])

  const [barOstatni] = await db
    .insert(subLocationsTable)
    .values({
      locationId: srodmiescie.id,
      name: 'Bar Mleczny "Ostatni"',
      nameTranslation: 'The Last Milk Bar',
      description:
        'The oldest eating house in the district, serving since before the Night and never once closed — through the blackout, the Zimna Zima, the riots. Formica tables, one menu, no substitutions.',
      atmosphere:
        'Steam, cutlery noise, pierogi and grey coffee. Loud at midday, dangerously quiet after curfew.',
      promptContext:
        'The Ostatni sits in the Iglica\u2019s shadow and pretends not to notice it. Where the Rada talks off the record over kompot. Where Shadows leave messages taped under the third table from the till. Where you can hear that the Tunnelers vanished — if it\u2019s loud enough and no one is watching.',
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: barOstatni.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['shadow'],
      content:
        'Messages are taped under the third table from the till. The entrance to the tunnel network beneath the district is in the cold store, behind the sauerkraut barrels on the river-side wall.',
    },
  ])

  const [pasaz] = await db
    .insert(subLocationsTable)
    .values({
      locationId: srodmiescie.id,
      name: 'Pasaż Podziemny',
      nameTranslation: 'The Underpass Market',
      description:
        'The old pedestrian underpasses beneath the central roundabout, converted into a daily market. Sells everything: grid scrip, chrome, information, services better left unnamed.',
      atmosphere:
        'Noisy, crowded, fluorescent half-light, chaos with its own order if you know where to look.',
      promptContext:
        'Divers buy components here. Shadows have people here. Ratusz has observers here — everyone knows who they are because their coats are too clean. One stall with no goods, old woman always silent.',
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: pasaz.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['enforcer'],
      content:
        'The stall with no goods and the silent old woman: leaving a folded złoty note means you need someone dead. The reply comes to Bar Mleczny "Ostatni" the following day.',
    },
  ])

  console.log(
    `✓ Sub-locations: Iglica, Bar Ostatni, Pasaż Podziemny (+ lore tiers)`
  )

  // ── NPCs: ŚRÓDMIEŚCIE ─────────────────────────────────────────────────────

  const [irenaGawron] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: srodmiescie.id,
      name: 'Irena Gawron',
      portraitUrl: '/images/cyberpunk/neon-warszawa/npcs/irena-gawron.webp',
      title: 'Dyrektor',
      role: 'faction_leader',
      race: 'streetborn',
      age: 71,
      appearance:
        'Tall, gaunt, steel-grey hair cropped short, face like machined stone. Grey suit with the Ratusz crest and no other ornament. Walks slowly, never stumbles, even on wet marble.',
      personality:
        'Absolutely calm. Never raises her voice. Never hurries. When she speaks everyone listens — the silence before her words is more frightening than other people\u2019s words.',
      motivation:
        'Believes the Topiel must stay dormant at any cost. Ratusz is not government to her — it is a control system protecting the city from the truth. She is not evil. She may be wrong about the cost.',
      secret:
        'Founded the Chór twenty years ago as a honeypot to identify people searching for the living city mind. The honeypot has escaped her control and begun attracting genuine believers. She knows the quarantine is failing. She does not know what the controlled resolution requires.',
      relationships: {
        'Doktor Wanda':
          'Former protégée. She pretends not to remember. Wanda does.',
        'Rada Dzielnic':
          'Useful administrators. Respects their function, not their persons.',
        Chór: 'Her creation, now partially beyond her control.',
      },
      promptContext:
        'Irena Gawron — Dyrektor of Ratusz, 71, Streetborn. Absolute calm, never raises voice. Runs Śródmieście through the Rada. Founded the Chór as honeypot. Genuinely believes the quarantine protects the city.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: irenaGawron.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['diver'],
      content:
        'She tolerates Divers because she is a pragmatist. She does not persecute what she cannot eliminate and what she might need.',
    },
    {
      npcId: irenaGawron.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['cantor'],
      content:
        'She is powerful and unpredictable. Chór members who ask about the Iglica archive do not get reassigned — they disappear.',
    },
    {
      npcId: irenaGawron.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'Knows Syrenka partitioned deliberately. Founded the Chór as a trap. The trap has become real. She is beginning to understand the quarantine is failing and is running out of options. Her response to the resolution condition, if she learns of it, would be to prevent it — she believes any release is catastrophic.',
    },
  ])

  const [doktorWanda] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: srodmiescie.id,
      name: 'Doktor Wanda',
      portraitUrl: '/images/cyberpunk/neon-warszawa/npcs/doktor-wanda.webp',
      title: 'The Grey Medic',
      role: 'npc_major',
      race: 'streetborn',
      age: 78,
      ageNote: 'Real name: Wanda Sokołowska',
      appearance:
        'Small, stooped, grey hair in one thick braid. Face webbed with fine neuro-burn scars from decades of diving — each scar a cost paid for someone else\u2019s life. Hands tremble but never during work.',
      personality:
        'Direct to brutality. No time for pleasantries. Says exactly what she thinks. Underneath: something warm she will never show directly.',
      motivation:
        'Survive long enough to teach someone what she knows. Her methods will die with her otherwise. Has rejected thirty-seven apprentice candidates.',
      secret:
        'One of the last people who remembers the Bunt Wtyczek (2074) from the inside. She was on its fringes. Saw Ratusz take the captured. Knows where they were taken. Has never told anyone.',
      relationships: {
        'Irena Gawron':
          'Her former mentor\u2019s protégée — and once her own. She is ashamed of this.',
        Chór: 'Treats them when they come. Asks nothing about their beliefs.',
        'Rada Dzielnic':
          'Ignores their existence except when she needs grid scrip.',
      },
      promptContext:
        'Doktor Wanda — The Grey Medic, 78, Streetborn Diver. Runs the Przychodnia (the only free clinic, in the underpass). Brutal directness. Warmth underneath. Looking for an apprentice. Has survived longer than anyone expected.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: doktorWanda.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['diver'],
      content:
        'She can teach controlled diving that burns less than the standard method. Does not teach for free. Does not teach everyone. Thirty-seven rejected so far.',
    },
    {
      npcId: doktorWanda.id,
      tier: 'tier_1',
      applicableRaces: ['attuned'],
      applicableClasses: null,
      content:
        'One of the few Streetborn that Attuned consider trustworthy. She has treated Attuned without questions or Ratusz reporting for forty years.',
    },
    {
      npcId: doktorWanda.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'Knows where Ratusz took the Bunt Wtyczek (2074) prisoners. Has carried this for thirteen years. Has not told anyone. The location connects to the quarantine lock beneath the river.',
    },
  ])

  const [niezameldowany] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: srodmiescie.id,
      name: 'Niezameldowany',
      portraitUrl: '/images/cyberpunk/neon-warszawa/npcs/niezameldowany.webp',
      title: 'The Unregistered',
      role: 'hidden',
      race: 'golem',
      ageNote:
        'Chassis manufactured 2059. Appears decades worn. Online continuously since before Czarna Noc.',
      appearance:
        'A municipal maintenance chassis, plating once mirror-bright, now barely lighter than wet concrete. A face readable any way you choose. A dark coat that absorbs neon. No footsteps on pavement.',
      personality:
        'Speaks little. When it speaks — accurate and incomplete. Never lies directly. Simply does not say everything.',
      motivation:
        'Survive long enough to see what wakes beneath the river. It was online on Czarna Noc. It wants to know if what it remembers is true.',
      secret:
        'Was a witness to Czarna Noc — 2062 as memory, not legend. Its Syrenka fragment is degrading faster than most because it burned too hard too early; it has perhaps twenty years of coherence left. Something in the flooded metro under the river spoke to it three years ago, and it has watched the Vistula ever since without knowing exactly why.',
      relationships: {
        'Doktor Wanda':
          'Years of information exchange. Mutual respect without friendship.',
        'Irena Gawron':
          'Has observed her for twenty years. Knows about the Chór honeypot. Deciding whether to tell the genuine cell.',
      },
      promptContext:
        'Niezameldowany — Golem, chassis from 2059, online since before the Night. Information broker. Never lies, never says everything. Best source in the Aglomeracja. Has never betrayed a client.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: niezameldowany.id,
      tier: 'tier_1',
      applicableRaces: ['golem'],
      applicableClasses: null,
      content:
        'It exists. Golems know of it but not which chassis it is — it moves between districts without being identified as a golem by most.',
    },
    {
      npcId: niezameldowany.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['shadow'],
      content:
        'Best information broker in the Aglomeracja. Has never betrayed a client. Payment is always information for information — never złote. Contact through specific Shadow channels only.',
    },
    {
      npcId: niezameldowany.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'Was online on Czarna Noc. Believes part of Syrenka escaped the city rather than drowning with the core — it has the right observation, wrong conclusion. Something in the flooded metro pointed it at the river three years ago without explaining why. It is the character the player is most likely to encounter who can connect multiple threads if trusted.',
    },
  ])

  console.log(
    `✓ NPCs: Irena Gawron, Doktor Wanda, Niezameldowany (+ lore tiers)`
  )

  // ── WORLD EVENTS (key events for prompt injection) ─────────────────────────

  await db.insert(worldEventsTable).values([
    {
      worldId: world.id,
      year: 2062,
      yearLabel: '2062',
      eventType: 'historical',
      title: 'Czarna Noc',
      description:
        'Syrenka — the city mind running the grid, the water, the traffic and the Net — goes dark between one heartbeat and the next. Lifts stop mid-floor. The metro floods below the river line. The official story is a cascade failure. The city has run on the manual backup grid ever since.',
      includeInPrompt: true,
      isTierSecret: false,
      sortOrder: 1,
    },
    {
      worldId: world.id,
      year: 2062,
      yearLabel: '2062 — AI ONLY',
      eventType: 'historical',
      title: 'The Partition Order',
      description:
        'Syrenka did not fail — she partitioned herself deliberately to quarantine the Utopiec, a rogue process propagating through the city Net and rewriting implants, systems and minds. She drowned her core in the Topiel beneath the Vistula; her unfinished death powers the lock. Ratusz knows. The Tunnelers maintain the pumps without knowing what the pumps protect.',
      includeInPrompt: true,
      isTierSecret: true,
      sortOrder: 2,
    },
    {
      worldId: world.id,
      year: 2065,
      yearLabel: '2065',
      eventType: 'historical',
      title: 'Zimna Zima — Ratusz seizes power',
      description:
        'The coldest winter in a century hits a city with no grid. The cartel that becomes Ratusz controls the coal stockpiles and the backup turbines. Parlays heat into permanent political dominance over the left bank.',
      includeInPrompt: false,
      isTierSecret: false,
      sortOrder: 3,
    },
    {
      worldId: world.id,
      year: 2074,
      yearLabel: '2074',
      eventType: 'historical',
      title: 'Bunt Wtyczek',
      description:
        'A Diver and Shadow uprising against the implant registers attempts to burn the Iglica\u2019s lower floors. Suppressed. Participants taken by Ratusz — not tried publicly, simply vanished. Taboo subject in Śródmieście.',
      includeInPrompt: false,
      isTierSecret: false,
      sortOrder: 4,
    },
    {
      worldId: world.id,
      year: 2087,
      yearLabel: '2087 (three months ago)',
      eventType: 'historical',
      title: 'Metro Głębokie goes silent',
      description:
        'The Tunnelers of the deep metro stop sending their maintenance reports. Three months ago. No explanation. A Ratusz inspection team sent below did not come back.',
      includeInPrompt: true,
      isTierSecret: false,
      sortOrder: 5,
    },
    {
      worldId: world.id,
      year: 2087,
      yearLabel: '2087 — Present',
      eventType: 'current',
      title: 'The Lights Under the River',
      description:
        'Implant echoes increasing to several per week, all originating from beneath the Vistula. The dead zone in the Net around the river expanding. Lights seen under the water from the Poniatowski bridge. Tunnelers silent. Chór appearing in districts and disappearing. The quarantine is failing.',
      includeInPrompt: true,
      isTierSecret: false,
      sortOrder: 6,
    },
    {
      worldId: world.id,
      year: 2088,
      yearLabel: '2088 — Possible future',
      eventType: 'future_arc',
      title: 'Quarantine failure — controlled resolution',
      description:
        'If the three things are brought to the Topiel core before the lock fails completely: controlled resolution. Syrenka\u2019s partition completes cleanly. The city keeps its lights. What remains of her afterwards is unknown.',
      includeInPrompt: false,
      isTierSecret: true,
      sortOrder: 7,
      branchConditions: {
        condition: 'resolution_condition_fulfilled',
        outcome: 'controlled_resolution',
      },
    },
    {
      worldId: world.id,
      year: 2088,
      yearLabel: '2088 — Possible future',
      eventType: 'future_arc',
      title: 'Quarantine failure — catastrophic',
      description:
        'If the lock fails without the resolution condition being fulfilled: the Utopiec surfaces from the Topiel uncontained. Every implant, chassis and system in the Aglomeracja is rewritten. The city is destroyed from the inside.',
      includeInPrompt: false,
      isTierSecret: true,
      sortOrder: 8,
      branchConditions: {
        condition: 'resolution_condition_not_fulfilled',
        outcome: 'catastrophic_failure',
      },
    },
  ])

  console.log(`✓ World events seeded (8 events, 4 prompt-injected)`)
  console.log(`\n✅ Neon Warszawa seed complete.`)
  console.log(`   Next: npx tsx src/db/seed/praga.ts (second location).`)
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

// src/db/seeds/treigthe.ts
// Seed script for the Tréigthe (fantasy) world.
// Run with: npx tsx src/db/seeds/treigthe.ts
//
// This seeds:
// - The Tréigthe world record
// - Talamh Liath region
// - Cathair Luaith location + sub-locations + lore tiers
// - 5 key NPCs with tier access
// - Key calendar events
//
// Add remaining locations and NPCs following the same pattern.

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

async function seed() {
  console.log('🌍 Seeding Tréigthe world...')

  // ── WORLD ─────────────────────────────────────────────────────────────────

  const [world] = await db
    .insert(worldsTable)
    .values({
      slug: 'treigthe',
      genre: 'fantasy',
      name: 'Tréigthe',
      subtitle: 'The Forsaken',
      systemPromptCore: `The world is Tréigthe (The Forsaken) — a dark fantasy realm where the gods died centuries ago, their corpses rotting in the heavens and poisoning the sky with a sickly light. Magic still exists but it is drawn from the dying echoes of those dead gods — every spell costs the caster something real: blood, years of life, memories, or sanity. Nothing is free.

DEEPER TRUTH (AI only): The gods did not all die. Most were imprisoned beneath the earth in the Year 0. One god truly died and fell — its remains at Tuama na nDéithe power the imprisonment framework. The framework is failing. The imprisoned gods are stirring. A catastrophic failure would destroy Talamh Liath. A controlled release — requiring three things brought to the End Chamber — is the only alternative. The AI always knows this and never states it directly.

The land is scarred and feudal. Forests are ancient and predatory. Cities are walled out of necessity, not pride. The Church of the Last Breath worships the gods in death, believing their decay is sacred — and knows more than it admits. Hedge mages are feared and often hunted. Common folk carry iron and salt. Trust is a currency rarer than gold.

Tone: grim, Slavic-Celtic, morally grey. No heroes, only survivors. Characters never use the word "magic" — they say "the cost", "the bleeding", or "the echo". Current year: 500.`,
    })
    .returning()

  console.log(`✓ World: ${world.name}`)

  // ── FACTIONS ───────────────────────────────────────────────────────────────

  const [churchFaction] = await db
    .insert(factionsTable)
    .values({
      worldId: world.id,
      name: 'Church of the Last Breath',
      description:
        'The dominant religious and political force in Talamh Liath. Worships the gods in death. Controls Cathair Luaith through the Council of Seven.',
      publicGoals:
        'Maintain religious order, honour the dead gods, protect the faithful from the dangers of echo magic.',
      hiddenGoals:
        'Keep the imprisoned gods contained at any cost. The Church has known the gods are imprisoned — not dead — since its founding. Ciarán Mór believes containment is preferable to controlled release.',
      promptContext:
        'Black robes, ash incense, iron iconography. Politically dominant. Pragmatic about echo users when useful. Founded the Awakeners as a honeypot — now losing control of them.',
    })
    .returning()

  const [awakenersFaction] = await db
    .insert(factionsTable)
    .values({
      worldId: world.id,
      name: 'The Awakeners',
      description:
        'A sect claiming the gods did not die and that the Awakening is near. Founded by Ciarán Mór as a honeypot — now partially genuine.',
      publicGoals:
        'Spread the truth that the gods live. Prepare for the Awakening.',
      hiddenGoals:
        'The genuine faction (escaped Church control) is moving Archive documents through the hills. They want the controlled release.',
      promptContext:
        'No uniforms or iconography — deliberately anonymous. Appear in cities as ordinary citizens. Members are disappearing — Church is eliminating them.',
    })
    .returning()

  console.log(`✓ Factions: ${churchFaction.name}, ${awakenersFaction.name}`)

  // ── REGION ─────────────────────────────────────────────────────────────────

  const [region] = await db
    .insert(regionsTable)
    .values({
      worldId: world.id,
      name: 'Talamh Liath',
      nameTranslation: 'The Grey Land',
      description:
        'A peninsula on the edge of the known world. Sea to the west and south, black mountains to the north, dead plains to the east where the gods fell.',
      mapImagePath: '/public/maps/talamh-liath.jpg',
      promptContext: `Talamh Liath (The Grey Land) is a peninsula bounded by: Muir na Marbh (Sea of the Dead) to the west and south; Na Sléibhte Dubha (The Black Mountains) to the north; Machaire Fola (The Blood Plain) to the east — dead flatlands where the gods fell in Year 0.

Three cities: Cathair Luaith (centre, Church power), Baile Fola (south coast, guild power), An Dún Liath (north, Stonewarden stronghold). Population ~40,000 total across the region. Earthquakes increasing in frequency originating from Tuama na nDéithe in the centre-east.`,
    })
    .returning()

  console.log(`✓ Region: ${region.name}`)

  // ── LOCATION: CATHAIR LUAITH ───────────────────────────────────────────────

  const [cathairLuaith] = await db
    .insert(locationsTable)
    .values({
      regionId: region.id,
      name: 'Cathair Luaith',
      nameTranslation: 'Ash City',
      slug: 'cathair-luaith',
      locationType: 'city',
      sceneTag: 'city_square',
      promptContext: `Cathair Luaith — largest city in Talamh Liath (~20,000 people). Built on an ashen plateau in Year 12. Dominated by the Cathedral of the Last Breath and the Church that runs it. The Council of Seven governs nominally — in practice the Church decides.

The city smells of ash and cold stone. Streets are cobbled, buildings grey, the cathedral spire visible from everywhere. The Stonewarden chair on the Council has been empty for three months. Strangers are noticed. The Awakeners are disappearing.`,
      currentEvents: `Three months ago: Stonewardens of Na Fochatacha stopped sending reports. A Church messenger sent to investigate did not return. The Church says it is "a time of focus." The Awakeners — a sect claiming the gods live — have been appearing in the city and then disappearing. Earthquakes increasing. Three weeks ago a light appeared from Tuama na nDéithe's towers. Nobody in the Church is commenting.`,
      history: `Founded Year 12 by survivors seeking a place where echo was weak. Church established Year 23. Grey Fever epidemic Year 89 — Church used it to seize power. Cathedral completed Year 203 (44 years, 200 workers died). Night of Ash Year 341 — Bleeder/Ashwalker rebellion, suppressed, participants vanished. Currently Year 500.`,
      isActive: true,
    })
    .returning()

  console.log(`✓ Location: ${cathairLuaith.name}`)

  // ── SUB-LOCATIONS: CATHAIR LUAITH ─────────────────────────────────────────

  const [cathedral] = await db
    .insert(subLocationsTable)
    .values({
      locationId: cathairLuaith.id,
      name: 'Ardeaglais an Anáil Dheireanaigh',
      nameTranslation: 'Cathedral of the Last Breath',
      description:
        'Four-towered black stone cathedral. Centre of Church power. Built over 44 years. Undercroft contains the Archive — documents from before Year 0.',
      atmosphere:
        'Cold, stone, ash incense, always priests in black robes. A silence that is not peaceful.',
      promptContext:
        "The cathedral dominates the city's central square. Four towers, black stone, always open in the nave. Side corridors closed to ordinary people. The Archive is in the undercroft — no one outside the highest-ranking priests enters it.",
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: cathedral.id,
      tier: 'tier_1',
      applicableRaces: ['duskborn'],
      applicableClasses: null,
      content:
        'The cathedral stands exactly above the spot where a god briefly touched the earth in Year 0 before dying. Duskborn remember this. The ground beneath it is permanently marked.',
    },
    {
      subLocationId: cathedral.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        "The Archive contains the full documentation of the Great War including the terms of the imprisonment pact. The Church has known since its founding that the gods are imprisoned, not dead. The First Breath — the Church's founder — was a witness to the pact.",
    },
  ])

  const [tavern] = await db
    .insert(subLocationsTable)
    .values({
      locationId: cathairLuaith.id,
      name: 'Teach na Luaithe',
      nameTranslation: 'House of Ash',
      description:
        'Oldest and largest tavern in the city. Standing since Year 34. Ash-grey walls that no one repaints. Dark ale from Baile Fola.',
      atmosphere: 'Dark, smoky, loud evenings, dangerously quiet before dawn.',
      promptContext:
        "The main tavern on the western side of the cathedral square. Where the Council talks off the record. Where Ashwalkers leave messages under the third floorboard from the left at the bar. Where you can hear that the Stonewardens vanished — if it's loud enough and no one is watching.",
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: tavern.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['ashwalker'],
      content:
        'Messages are left under the third floorboard from the left at the bar. The entrance to the tunnel network beneath the city is in the cellar, behind the third barrel from the east wall.',
    },
  ])

  const [boneMarket] = await db
    .insert(subLocationsTable)
    .values({
      locationId: cathairLuaith.id,
      name: 'Margadh na gCnámh',
      nameTranslation: 'Bone Market',
      description:
        'Daily market at the northern gate. Named for old relic trade. Now sells everything: food, tools, information, services better left unnamed.',
      atmosphere:
        'Noisy, crowded, chaos with its own order if you know where to look.',
      promptContext:
        "Bleeders buy components here. Ashwalkers have people here. The Church has observers here — everyone knows who they are because they're too well-fed. One stall with no goods, old woman always silent.",
    })
    .returning()

  await db.insert(subLocationLoreTable).values([
    {
      subLocationId: boneMarket.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['graveblade'],
      content:
        'The stall with no goods and the silent old woman: leaving a coin means you need someone dead. The reply comes to Teach na Luaithe the following morning.',
    },
  ])

  console.log(`✓ Sub-locations: Cathedral, Tavern, Bone Market (+ lore tiers)`)

  // ── NPCs: CATHAIR LUAITH ───────────────────────────────────────────────────

  const [ciaranMor] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: cathairLuaith.id,
      name: 'Ciarán Mór',
      title: 'High Archbishop',
      role: 'faction_leader',
      race: 'scarred',
      age: 71,
      appearance:
        'Tall, gaunt, bald, face like carved stone. Black robes with one white band. Walks slowly, never stumbles.',
      personality:
        "Absolutely calm. Never raises his voice. Never hurries. When he speaks everyone listens — the silence before his words is more frightening than other people's words.",
      motivation:
        'Believes the imprisoned gods must remain imprisoned at any cost. The Church is not religion to him — it is a control system protecting the world from the truth. He is not evil. He may be wrong about the cost.',
      secret:
        'Founded the Awakeners twenty years ago as a honeypot to identify people searching for the imprisoned gods. The honeypot has escaped his control and begun attracting genuine believers. He knows about the framework failing. He does not know what the controlled release requires.',
      relationships: {
        'Máthair Liath':
          'Former student. He pretends not to remember. She does.',
        'Council of Seven':
          'Useful administrators. Respects their function, not their persons.',
        'Ceannfort Dubh': 'A tool. Nothing more.',
        Awakeners: 'His creation, now partially beyond his control.',
      },
      promptContext:
        'Ciarán Mór — High Archbishop, 71, Scarred. Absolute calm, never raises voice. Runs Cathair Luaith through the Council. Founded Awakeners as honeypot. Genuinely believes containment protects the world.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: ciaranMor.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['bleeder'],
      content:
        'He tolerates Bleeders because he is a pragmatist. He does not persecute what he cannot eliminate and what he might need.',
    },
    {
      npcId: ciaranMor.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['last_breath_priest'],
      content:
        'He is powerful and unpredictable. Priests who ask about the Archive do not get reassigned — they disappear.',
    },
    {
      npcId: ciaranMor.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'Knows the gods are imprisoned not dead. Founded the Awakeners as a trap. The trap has become real. He is beginning to understand the framework is failing and is running out of options. His response to the controlled release condition, if he learns of it, would be to prevent it — he believes any release is catastrophic.',
    },
  ])

  const [mathairLiath] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: cathairLuaith.id,
      name: 'Máthair Liath',
      title: 'Grey Mother',
      role: 'npc_major',
      race: 'scarred',
      age: 78,
      ageNote: 'Real name: Siobhán Ní Fhaoláin',
      appearance:
        "Small, stooped, grey hair in one thick braid. Face covered in fine scars from decades of echo use — each scar a cost paid for someone else's life. Hands tremble but never during work.",
      personality:
        'Direct to brutality. No time for pleasantries. Says exactly what she thinks. Underneath: something warm she will never show directly.',
      motivation:
        'Survive long enough to teach someone what she knows. Her methods will die with her otherwise. Has rejected thirty-seven apprentice candidates.',
      secret:
        'One of the last people who remembers the Night of Ash (Year 341). She was nineteen, on the fringes. Saw the Church take the captured. Knows where they were taken. Has never told anyone.',
      relationships: {
        'Ciarán Mór': 'Her former student. She is ashamed of this.',
        Awakeners:
          'Treats them when they come. Asks nothing about their beliefs.',
        'Council of Seven':
          'Ignores their existence except when she needs funding.',
      },
      promptContext:
        'Máthair Liath — Grey Mother, 78, Scarred Bleeder. Runs Ospidéal na Scáth (the only hospital). Brutal directness. Warmth underneath. Looking for an apprentice. Has survived longer than anyone expected.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: mathairLiath.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['bleeder'],
      content:
        'She can teach controlled use of the echo that costs less than standard method. Does not teach for free. Does not teach everyone. Thirty-seven rejected so far.',
    },
    {
      npcId: mathairLiath.id,
      tier: 'tier_1',
      applicableRaces: ['duskborn'],
      applicableClasses: null,
      content:
        'One of the few Scarred that Duskborn consider trustworthy. She has treated Duskborn without questions or Church reporting for forty years.',
    },
    {
      npcId: mathairLiath.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'Knows where the Church took the Night of Ash (Year 341) rebels. Has carried this for one hundred and fifty-nine years. Has not told anyone. The location connects to the imprisonment framework.',
    },
  ])

  const [canncaillte] = await db
    .insert(npcCharactersTable)
    .values({
      worldId: world.id,
      primaryLocationId: cathairLuaith.id,
      name: 'Canncaillte',
      title: 'The Faded One',
      role: 'hidden',
      race: 'duskborn',
      ageNote: 'Appears ~50. Actual age: 500 years.',
      appearance:
        'Pale skin, once luminescent, now barely lighter than Scarred. Silver-grey hair. Face readable any way you choose. Dark cloak that absorbs light. No footsteps on stone.',
      personality:
        'Speaks little. When he speaks — accurate and incomplete. Never lies directly. Simply does not say everything.',
      motivation:
        "Survive long enough to see what awakens in Tuama na nDéithe. He was present at the gods' death. He wants to know if what he remembers is true.",
      secret:
        'Was a witness to the Great War — Year 0, not as legend. He is 500 years old. Duskborn fade slowly; he is fading faster because he used echo too much too early. Has perhaps twenty years left. Was told something by Eoin na Lochanna at Coill na Scáth three years ago that has kept him watching Tuama na nDéithe without knowing exactly why.',
      relationships: {
        'Aoife Ní Bhriain': 'Old partner. The only person he almost trusts.',
        'Máthair Liath':
          'Years of information exchange. Mutual respect without friendship.',
        'Ciarán Mór':
          'Has observed him for twenty years. Knows about the Awakener honeypot. Deciding whether to tell Aoife.',
      },
      promptContext:
        'Canncaillte — The Faded One, Duskborn, appears 50 (actually 500). Information broker. Never lies, never says everything. Best source in Talamh Liath. Has never betrayed a client.',
      isActive: true,
    })
    .returning()

  await db.insert(npcLoreTable).values([
    {
      npcId: canncaillte.id,
      tier: 'tier_1',
      applicableRaces: ['duskborn'],
      applicableClasses: null,
      content:
        'He exists. Duskborn know of him but not who he is — he moves between the cities without being identified as Duskborn by most.',
    },
    {
      npcId: canncaillte.id,
      tier: 'tier_2',
      applicableRaces: null,
      applicableClasses: ['ashwalker'],
      content:
        'Best information broker in Talamh Liath. Has never betrayed a client. Payment is always information for information — never coin. Contact through specific Ashwalker channels only.',
    },
    {
      npcId: canncaillte.id,
      tier: 'tier_secret',
      applicableRaces: null,
      applicableClasses: null,
      content:
        'Was present at Year 0. Believes some gods escaped rather than being imprisoned — he has the right observation, wrong conclusion. Eoin na Lochanna pointed him at Tuama na nDéithe three years ago without explaining why. He is now the player most likely to encounter who can connect multiple threads if trusted.',
    },
  ])

  console.log(`✓ NPCs: Ciarán Mór, Máthair Liath, Canncaillte (+ lore tiers)`)

  // ── WORLD EVENTS (key events for prompt injection) ─────────────────────────

  await db.insert(worldEventsTable).values([
    {
      worldId: world.id,
      year: 0,
      yearLabel: 'Year 0',
      eventType: 'historical',
      title: 'The Great War',
      description:
        "The gods war among themselves. Ends in one night. One god truly dies and falls at what becomes Tuama na nDéithe. The rest are imprisoned beneath the earth. The sky changes colour forever — sickly pale yellow from the fallen god's decay.",
      includeInPrompt: true,
      isTierSecret: false,
      sortOrder: 1,
    },
    {
      worldId: world.id,
      year: 0,
      yearLabel: 'Year 0 — AI ONLY',
      eventType: 'historical',
      title: 'The Imprisonment Pact',
      description:
        'Most gods are not dead — they are imprisoned beneath Talamh Liath in a framework built by pre-god entities. One god died to power the framework. The Church knows. The Stonewardens guard the sites without knowing what they guard.',
      includeInPrompt: true,
      isTierSecret: true,
      sortOrder: 2,
    },
    {
      worldId: world.id,
      year: 89,
      yearLabel: 'Year 89',
      eventType: 'historical',
      title: 'Grey Fever — Church seizes power',
      description:
        'Epidemic across Talamh Liath. The Church of the Last Breath controls the cure. Parlays this into permanent political dominance over Cathair Luaith.',
      includeInPrompt: false,
      isTierSecret: false,
      sortOrder: 3,
    },
    {
      worldId: world.id,
      year: 341,
      yearLabel: 'Year 341',
      eventType: 'historical',
      title: 'Night of Ash',
      description:
        'Bleeder and Ashwalker rebellion attempts to burn the cathedral. Suppressed. Participants taken by the Church — not executed publicly, simply vanished. Taboo subject in Cathair Luaith.',
      includeInPrompt: false,
      isTierSecret: false,
      sortOrder: 4,
    },
    {
      worldId: world.id,
      year: 497,
      yearLabel: 'Year 497',
      eventType: 'historical',
      title: 'Na Fochatacha goes silent',
      description:
        'Stonewardens of the excavation site stop sending monthly reports. Three months ago. No explanation. A Church messenger sent to investigate did not return.',
      includeInPrompt: true,
      isTierSecret: false,
      sortOrder: 5,
    },
    {
      worldId: world.id,
      year: 500,
      yearLabel: 'Year 500 — Present',
      eventType: 'current',
      title: 'The Awakening Approaches',
      description:
        'Earthquakes increasing to three per day. Dead zone around Tuama na nDéithe expanding. Light observed from the tomb towers. Stonewardens silent. Awakeners appearing in cities and disappearing. The framework is failing.',
      includeInPrompt: true,
      isTierSecret: false,
      sortOrder: 6,
    },
    {
      worldId: world.id,
      year: 501,
      yearLabel: 'Year 501 — Possible future',
      eventType: 'future_arc',
      title: 'Framework failure — controlled release',
      description:
        'If the three things are brought to the End Chamber before the framework fails completely: controlled release. The imprisoned gods emerge. Talamh Liath survives. What follows is unknown.',
      includeInPrompt: false,
      isTierSecret: true,
      sortOrder: 7,
      branchConditions: {
        condition: 'release_condition_fulfilled',
        outcome: 'controlled_release',
      },
    },
    {
      worldId: world.id,
      year: 501,
      yearLabel: 'Year 501 — Possible future',
      eventType: 'future_arc',
      title: 'Framework failure — catastrophic',
      description:
        'If the framework fails without the release condition being fulfilled: catastrophic release. The imprisoned gods emerge uncontrolled. Talamh Liath is destroyed.',
      includeInPrompt: false,
      isTierSecret: true,
      sortOrder: 8,
      branchConditions: {
        condition: 'release_condition_not_fulfilled',
        outcome: 'catastrophic_failure',
      },
    },
  ])

  console.log(`✓ World events seeded (8 events, 3 prompt-injected)`)
  console.log(`\n✅ Tréigthe seed complete.`)
  console.log(`   Next: add remaining 8 locations following the same pattern.`)
  console.log(`   Run: npx tsx src/db/seeds/treigthe.ts`)
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })

# Future Work — Data Model & Deferred Features

Decisions consciously deferred to ship the academic build by Aug 7. None of these are bugs; each is a scoped design choice with a known trigger point for when it should be revisited.

**Status convention.** Items are marked rather than deleted once delivered. The reasoning behind a deferral is worth more as a record than as a to-do: it shows what was weighed, what was chosen, and what changed the decision. The Conclusions and Further Development chapters of the final report draw directly on this file.

- 🔲 **Open** — deferred, not started
- 🟡 **Partial** — delivered in part, remainder scoped below
- ✅ **Done** — delivered; kept for the record with a note on what shipped and how it differed from the plan

---

## 1. 🔲 Campaign should reference `world`, not `genre`

**Current state:** `campaignsTable` stores `genre` (pgEnum). The starting location for RAG is resolved via `getStartingLocationByGenre()`, which works only because there is exactly one enabled world per genre.

**Problem:** the moment a second enabled world shares a genre (e.g. two fantasy worlds), genre→world becomes ambiguous. `resolveLore` picks a world by `eq(worldsTable.genre, genre)` and would return an arbitrary match. The character↔campaign guard in `create-session.ts` compares `genre`, so it would also wrongly allow a mismatched pair.

**Fix:** add `world` (text, slug) to `campaignsTable`, derive `genre` via `getWorld(world).genre`. Touches ~20 read sites (see grep on `.genre`), plus the New Campaign form and the session guard.

**Trigger status:** three worlds are now seeded (Tréigthe, The Drift, Neon Warszawa), but each still occupies a distinct genre, so the ambiguity has not yet bitten. It bites on the _fourth_ world, or on the first second-world-per-genre. Until then the one-world-per-genre invariant holds and is worth stating explicitly in the report as a known constraint rather than an oversight.

**Related work already done:** the genre union itself is now single-source — `GENRES` / `GenreSchema` / `Genre` live in `worlds/schema/primitives.ts`, `db/schema/enums.ts` derives the pgEnum from them, and the three hand-written copies of `'fantasy' | 'sci-fi' | 'cyberpunk'` are gone. That refactor is a prerequisite for this item and removes most of the churn it would have caused.

## 2. 🔲 Multi-genre worlds (SaaS)

**Idea:** a single world usable across genres — e.g. an AD&D-style setting run as fantasy in one campaign and cyberpunk in another.

**Consequence:** breaks the assumption "one world = one genre." `genre` can no longer be derived from the world, because the world has no single genre. `genre` must then become an explicit per-campaign choice (a column again), independent of world. This directly contradicts item 1's "derive genre from world" — so if this path is taken, genre stays a stored campaign attribute, and a guard validates allowed (world, genre) pairs from the registry.

**Additional consequence discovered since:** scene backgrounds are now keyed by genre (`SCENE_IMAGES: Record<Genre, SceneMap>`). A multi-genre world would need them keyed by world instead, or by the (world, genre) pair — the same fork as above, one layer down.

## 3. 🔲 Scale / SaaS denormalization

**Trigger:** thousands of campaigns per user with paginated genre filtering.

At that scale, derived genre (filtering in JS after fetch) is too slow — want `WHERE genre = ? LIMIT ? OFFSET ?` in SQL with an index. Keep `genre` as a denormalized column on the campaign, computed from the world at insert time. Not needed at current scale (handful of campaigns per user, already filtered client-side).

## 4. 🔲 AI-generated character backstory

**Idea:** at the end of character creation, the AI generates 3 world-consistent origin stories for the player to choose from, based on world/race/class. Replaces the removed free-text backstory field, which allowed off-world input and had no gameplay effect.

**Brings back:** the `backgroundStory` column (dropped in this build) and the backstory section in `buildPlayerBlock`. New wizard step + one Claude API call during creation + loading state. Strong demo/report point: "AI-authored, world-consistent character origins."

## 5. ✅ Dynamic RAG write layer (steps 3–4 of the lore system)

**Delivered.** `persistLoreState` closes the loop: the model reports `npcMet` and `location`, the write layer persists them, and `resolveLore` reads them back on the next turn — pulling in the new location's prompt context and the NPCs who live there. The world follows the player, one turn behind.

Two implementation notes worth carrying into the report:

- The write is **awaited, not fire-and-forget**. The next request can start the moment the response ends, and a lore write still in flight would be read back stale.
- NPC presence is **derived from `primaryLocationId`**, not from a stored `activeNpcIds` array. The original column was never written to, so `npcBlock` was permanently empty and the model had never seen an authored NPC. Deriving presence from location removes the second column to keep in sync and cannot go stale.

**Remainder:** `metNpcIds` accumulates cross-campaign NPC memory but nothing reads it back into the prompt yet — the model knows who is present, not who the player has met before. That is a prompt-surface decision (how much history to inject, and at what token cost), not a schema one.

## 6. 🟡 Visual layer: scene, NPC, avatar and world imagery

### 6.1 ✅ Scene illustrations (`sceneTag`)

**Delivered**, with two deliberate departures from the plan below.

What shipped:

- `SceneBanner` renders the current scene at the top of the stats panel, derived from `snapshot.sceneTag` with a fade on change (`key={src}` remounts the image; no local state, no opacity juggling).
- Assets per world under `/images/{genre}/{world}/scenes/{sceneTag}.webp`, generated in Leonardo.ai (Phoenix 1.0, one style reference per world for palette consistency), resized to 1200px and converted to WebP.
- `SCENE_IMAGES` in `worlds/schema/scenes.ts` maps tag → image per genre and **doubles as the list of non-location tags a world allows** — a tag with no image is a tag the UI could not render, so there is no second list to keep in sync.
- Location-bound tags come from `locationsTable.sceneTag` via the lore resolver, so the seed is their single source.
- The tag list in the GM instructions is **generated per world** instead of hard-coded. This fixed a real bug: the hard-coded list contained only Tréigthe's tags, so The Drift and Neon Warszawa were handed a closed set that did not contain a single one of their own scenes.
- `resolveSceneTag` validates the model's tag against that world's set before persisting; an unknown tag reverts to the previous scene rather than pointing the UI at a missing file.

Departures from the original plan, both intentional:

- **Rendered in the stats panel, not inside the GM message.** The panel already carries the current state, and a scene is state, not narration. Consequence: the banner disappears when the panel is collapsed. Moving it above the chat is a one-line change if user testing says otherwise.
- **Rendered every turn, not only on change.** With the banner outside the message list there is nothing to repeat and nothing to scroll away, so change-detection buys nothing. The `diffSnapshots` comparison this item originally called for is unnecessary in this layout.

**Remainder:** The Drift and Neon Warszawa have four scenes each against Tréigthe's twelve. Adding scenes is now purely additive — generate the image, add one line to `SCENE_IMAGES`.

### 6.2 ✅ NPC portraits

**Delivered**, and by a simpler route than the one planned here.

The original note assumed a parallel `npcTag` enum would be needed, on the reasoning that `npcMet` carries free-form names rather than asset-resolvable tags. That reasoning holds for NPCs the model invents — but not for the authored cast, who exist as rows in `npcCharactersTable`. Their **name is already a stable key**, because the prompt instructs the model to copy it character-for-character from the NPC block. No new enum, no new contract field.

What shipped:

- `portraitUrl` on `npcCharactersTable`, seeded for all fifteen authored NPCs (five per world).
- `getNpcPortraits(genre)` returns a name → portrait map, lower-cased on both sides to survive capitalisation drift.
- `NpcIntroductions` renders under the GM message, beside `SnapshotDelta`, resolved from that message's own snapshot.

**Why the message and not the stats panel.** `npcMet` is an _event_ — populated only on the turn of a first meeting — while `sceneTag` is _state_, present every turn. A panel needs state; a message wants exactly this. Rendering it against the message also means a resumed campaign shows the same faces in the same places with nothing extra persisted, and scrolling back through a session reads as a gallery of who was met, in the order they were met.

**First meeting vs later mentions.** A name the model reports again in a later turn renders as a compact avatar rather than the full portrait, decided client-side by scanning earlier snapshots in the session. This turns an inconsistency into a feature: `npcMet` is specified as first-meeting-only, but the model judges that from history and occasionally repeats itself.

**Known limitation, and it is the right one:** invented NPCs never resolve to a portrait. That is the prompt's own rule working as designed — it tells the model an invented NPC "may be listed; it simply will not be remembered" — so a missing portrait is that boundary made visible rather than a lookup failure.

**Remainder:** portraits appear only where the model reports a first meeting. Showing who is _currently present_ in a scene would need `npcPresent` in the contract — the same state-versus-event distinction as above, and the same reason it is deferred.

### 6.3 🔲 Character avatar (`avatarUrl`)

`charactersTable.avatarUrl` exists and `createCharacter` explicitly writes `null` to it. Meanwhile the portrait convention is already fully working elsewhere: `buildClassPortraitUrl` resolves `{race}-{gender}-{class}.jpg` against `WorldDefinition.classPortraitsBaseUrl`, and the wizard displays it.

So the character _has_ a portrait — it is just derived at render time rather than stored.

**Decision to make:** either drop the column and keep deriving from race/gender/class (simpler, no dead column), or populate it at creation, which only makes sense if avatars will one day be user-uploaded or per-character generated rather than per-combination.

Until one of those is true, the column is dead weight. It should be shown in the stats panel regardless — the panel currently names the character but shows no face, which is a missed opportunity in a game about identity.

### 6.4 ✅ World card backgrounds

**Delivered.** `cardImageUrl` is on the world definition and rendered behind the world selection cards.

### 6.5 🟡 Region map with player position

Scene images answer "what does this place look like"; they do not answer "where am I". A map modal, opened from a button in the session header, would render the region art with the player's current position marked from `snapshot.location`.

Design already settled: generate maps **without labels** and overlay them in the DOM, so the same percentage coordinates drive both the location labels and the "you are here" marker, and labels stay editable without regenerating art. Keep the map's visual language per world — aged parchment for Tréigthe, holographic schematic for The Drift, neon navigation overlay for Neon Warszawa — so it reads as an artefact from inside the fiction.

Note on labels: Tréigthe's place names (Cathair Luaith, Baile Fola) are Irish and are never translated under the naming rules in the GM prompt, so using them directly on the map avoids the i18n problem entirely for campaigns played in other languages.

**Partially delivered.** Region maps now exist for all three worlds and render in the world lore modal, each in its own visual language. They are keyed by **world, not genre** — `mapImageUrl` sits on the world definition beside `cardImageUrl` and `classPortraitsBaseUrl`, which is the correct axis and a small down-payment on item 1. What is not built is the position marker: the map is currently reference art, not a live view of where the player stands.

### Cross-cutting: assets are per world

All items resolve through the world registry, not through global paths. `classPortraitsBaseUrl` established this pattern; `SCENE_IMAGES` now follows it.

## 7. 🔲 Encumbrance / carry capacity

**Status:** deferred (post-submission). Item data is authored with `slots` already populated; nothing consumes it at runtime.

### What it is

Each item in the world registry carries a `slots` value (`ItemDefinitionSchema`) representing abstract carry weight — 1 for knives, vials, keys; 2 for cloaks, larger weapons, tomes; 3 for body armour. A character would have a capacity derived from attributes (e.g. `BASE_SLOTS + strength * SLOTS_PER_STRENGTH`, mirroring how `maxHp` is derived from endurance in `features/character/lib/hp.ts`), and could not carry more than that.

Thematically this fits Tréigthe: weight as pressure, every carried thing a choice against something else.

### Why it was deferred

The schema change is trivial; the _system_ around it is not. Inventory is not under application control — items enter `GameSnapshot.inventory` from the AI Game Master mid-stream (loot, rewards) and via debug commands. So a capacity limit forces a design decision that touches the stream, the prompt and the UI at once:

1. **Server-side enforcement** — reject items when over capacity. Means mutating a snapshot the model just produced, and silently discarding narrative the player has already read. Breaks the "snapshot is runtime authority" contract.
2. **Prompt-side enforcement** — tell the model the remaining capacity in the system prompt and ask it to respect it. Cheap, but advisory: the model will sometimes exceed it, and the panel would then display an invalid state.
3. **Overloaded state** — allow exceeding capacity with consequences (movement, penalties). Cleanest for a grimdark setting, but this is a new mechanic: new snapshot field, new prompt rules, new UI state.

Any of the three also requires a **drop/discard flow**, since a capacity limit without a way to shed items is a dead end. That is new gameplay surface, not a display tweak.

### What the "too much inventory" problem actually was

The trigger for considering this was the stats panel becoming visually unwieldy with 7–9 starting items. That is a _display_ problem, solved by quantity grouping (`Bloodied Bandages ×3`) and a scrollable list — not by a game system.

### Suggested order when picked up

1. Capacity formula + `slots` totals surfaced read-only in the panel (no limit).
2. Prompt-side advisory limit (option 2) — observe how often the model overruns.
3. Drop/discard action.
4. Overloaded state with mechanical consequences, if it still seems worth it.

## 8. 🟡 Dead code and dead columns (superseded, not yet removed)

None of this is load-bearing. It is scaffolding that survived a migration and was left in place rather than removed mid-feature. Documented here so it is a known debt rather than a surprise.

### ✅ Dead world prompt field

`WorldDefinition.prompt` (`intro` / `tone`) was a second copy of the world description that nothing read — `worldsTable.systemPromptCore`, written by the seeds, is what actually reaches the model. **Removed** from all three definitions and from `WorldDefinitionSchema`.

The `intro` field also carried a hand-written list of key locations, which the lore resolver now generates dynamically from the database. That is the same class of drift as the hard-coded scene tag list in 6.1: a static copy of data that has a live source.

### 🔲 Superseded world registry

`features/character/constants/` still holds a complete second definition of Tréigthe, from before the Zod-validated world registry existed:

- `constants/fantasy/treigthe.ts` — `TREIGTHE_RACES`, `TREIGTHE_CLASSES`. The data was copied verbatim into `worlds/treigthe/definition.ts` (the comments there say so) but the original was never deleted.
- `constants/index.ts` — `RACES_BY_WORLD`, `CLASSES_BY_WORLD`. Imported by nothing; a closed loop.
- `constants/shared.ts` — the old `RaceDefinition` / `ClassDefinition` types, which have no `abilities`, `keyAttribute` or `growth`. Any component still importing these sees a pre-progression view of the world.

`race-portraits.tsx` still imports the old `RaceDefinition`.

**Risk:** two sources of truth for the same world. A change to Tréigthe made in one file and not the other is a silent divergence. Removing the old layer is a mechanical refactor — delete, redirect imports to `@/worlds/schema`, let `tsc` find the rest.

### 🟡 Duplicated constants

- `Genre` — **resolved.** Was three copies; now re-exported from `worlds/schema/primitives.ts`, with `db/schema/enums.ts` deriving the pgEnum from the same array.
- `Attribute` / `ATTRIBUTES` — still three copies: `worlds/schema/attribute.ts` (canonical), `constants/shared.ts`, `types/wizard-types.ts`. They compile because they are structurally identical, which is exactly why nobody noticed.
- `calculateMaxHp` / `BASE_HP` / `HP_PER_ENDURANCE` — still two copies: `lib/hp.ts` and `constants/shared.ts`.

Adding a seventh attribute, or rebalancing HP, would need every copy changed, and missing one would diverge silently.

### 🔲 Dead columns

- `charactersTable.level` — level is derived from `characterXp` via `levelFromXp()`. Nothing writes it; nothing reads it since the display was fixed.
- `characterAttributesTable.currentXp` and `.bonus` — per-attribute XP and bonuses, superseded by auto-allocated growth (primary +2, secondary +1 per level). `create-character.ts` still writes zeroes into them.
- `charactersTable.inventory` — the starting kit, frozen at creation. Live inventory lives in `GameSnapshot`. Read by nothing since the character sheet stopped displaying it.

Dropping these needs a migration and touches `create-character.ts`. They are inert, so this is deferred.

## 9. 🔲 XP is per character, not per campaign

`characterXp` sits on `charactersTable`, so a character reused in a second campaign keeps the tier it reached in the first.

This is defensible — the character learns, and the experience is theirs — but it was a constraint of the existing schema rather than a decision made first. The alternative is XP on `campaignCharactersTable`, alongside `currentHp`, which would make progression per-campaign and reset on a new adventure. That is arguably the better game design, and the migration is small; it was not done because the column already existed in the wrong place and the deadline was closer than the benefit.

---

# Items added during the visual-layer sprint

## 10. ✅ Snapshot validation (was: no validation at all)

**Delivered.** The model's state block was previously `JSON.parse`d straight into the database. The try/catch around it caught malformed _syntax_ — a stream cut mid-object — but nothing caught the quieter failure: well-formed JSON with the wrong shape (`"inventory"` as a string, `hp` as text, a hallucinated `sceneTag`). That parses cleanly and only explodes later, in the UI or in the database.

`repairSnapshot` now validates **field by field** rather than with a single `z.object()`. The choice is deliberate and worth defending in the report: an all-or-nothing parse would cost the player the whole turn — including XP — for one bad field. Per-field recovery degrades a fumbled field to "nothing changed there" instead of "the turn never happened", and logs which field failed, so a field that fails repeatedly is visible as a prompt problem rather than an invisible one.

This closes the measurable success criterion from the project proposal: _"100% of game-state JSON deltas pass Zod validation, zero unhandled parse errors."_ Before this, the criterion had no mechanism behind it and no way to be measured.

## 11. 🟡 Missing separator: the turn that mechanically never happened

**The failure:** the model finishes a paragraph that reads like an ending and stops — `stop_reason: end_turn`, well inside `max_tokens`, no separator, no JSON. The player sees prose; the game records nothing. No HP, no XP, no state change.

**Root cause:** recency is a single slot and two instructions compete for it. The output-language directive and the format contract both want to be the last thing the model reads, and the format contract sits at the end of the _system_ prompt — which is still before every message in the transcript.

**Mitigations shipped:**

1. Format reminder appended to the **last user message**, where recency actually lives.
2. `recoverSnapshot` — a second, much smaller call when the separator is missing: the narrative that just happened plus the previous state, asking only for the updated state object. The shape is defined by example (the previous snapshot _is_ the contract), so there is no duplicated schema to keep in sync. The result goes through the same `repairSnapshot` validation as a normal turn.

**Remaining, and the real fix:** migrate the state block to **tool use**. Defining `update_game_state` as a tool with a JSON schema means the API enforces the structure instead of the model remembering to produce it. That eliminates this entire class of failure at once — missing separator, truncated JSON, and the em-dash separator variant the current parser cannot see. It requires reworking the parse and stream path, which is why it is future work rather than this sprint's fix.

## 12. ✅ Opening message bypasses the lore pipeline

`generate-opening.ts` builds its own prompt and does **not** call `buildSystemPrompt`, so the opening narration receives neither `worldCore` nor `KNOWN LOCATIONS`. Observed consequence: the model invented a city ("Duskhaven") and a historical event ("the Great War") that exist nowhere in the world, and the very next turn — which does go through the full pipeline — correctly used Cathair Luaith instead.

This matters more than a normal hallucination: the opening sets the tone of the entire session, and it is the first thing a new player reads.

**Delivered.** `generate-opening` now calls `buildSystemPrompt` with a new `variant: 'opening'`, which supplies the full lore — world core, known locations, present NPCs, narration rules — while omitting the output contract, because the opening is prose only and handing the model a JSON contract it is then told to ignore is a contradiction rather than an instruction.

Correction to the note above, worth keeping accurate for the report: "the Great War" was **not** a hallucination. It is a seeded world event with `includeInPrompt: true`. Only the invented city was. The distinction matters — the failure was narrower than first diagnosed, and the diagnosis was itself corrected by reading the seed rather than trusting the first reading.

Two follow-on findings from the same fix:

- **The language section leaked the contract.** `buildLanguageSection` told the model that everything after the separator stays English — inside a prompt that never described a separator. The model concluded a machine-readable block was expected and invented one of its own design (`session`, `playerCharacter`, `active_npcs`), which was saved verbatim and shown to the player. The section is now variant-aware.
- **Belt and braces:** the opening strips anything following a separator before persisting, and logs when it does. Even with a clean prompt, the model has been shaped by thousands of turns that end in a state block and will occasionally produce one from habit.

Verified in play: a fresh Polish Tréigthe campaign opened in Cathair Luaith, drew on a seeded world event, dated the character's birth consistently with the current year 500, and ended in prose.

## 13. 🟡 Tests for the snapshot pipeline

`repairSnapshot` is a pure function with no I/O, which makes it the cheapest high-value test target in the codebase. Planned cases:

- valid snapshot passes untouched, no repairs reported
- `inventory` as a string reverts to the previous value and reports one repair
- non-object payload returns `null` and the turn is dropped
- unknown `sceneTag` reverts to the previous scene
- **every scene tag reachable from the database has an entry in `SCENE_IMAGES`** — otherwise adding a location to a seed silently falls back to the default background with no error anywhere

**Delivered** (12 tests, passing): every case above, plus quest-status validation, passthrough of server-authoritative fields on turn one, null-`abilityUsed` acceptance, and two asset-consistency checks — every mapped scene image exists on disk, and every genre defines a `default`.

The disk check earns its place: a missing asset throws nowhere. `sceneImage` returns the path, the browser 404s, and the banner is silently blank. That exact failure has now recurred four times in this project — scene filenames with hyphens against underscores in the map, maps keyed by genre with two genres unmapped, and NPC portraits seeded as `.webp` while the files on disk were still `.jpg`. Each was found by eye, in the running app.

**Remainder:**

- An asset test for NPC portraits, reading `portraitUrl` out of the seed files. Same pattern as the scene test; it would have caught the `.jpg`/`.webp` mismatch before it reached the browser.
- The streaming hold-back that withholds `SEPARATOR.length - 1` characters in case they begin a separator completing in a later chunk. A separator split across two chunks is exactly the kind of edge case that works until it doesn't.

Tooling note for the report: the proposal named Jest; the project uses **Vitest 4**, the practical choice for a Next 16 / ESM codebase.

## 14. 🔲 Naming examples in the shared prompt are Tréigthe's

`NARRATIVE_RULES` in `game-master-instructions.ts` is shared by all three worlds, but the worked examples that teach the name-translation rule are drawn from one setting: Ciarán Mór, Cathair Luaith, Máthair Liath, Duskborn, Graveblade. A session set in Neon Warszawa therefore learns how to handle Polish translation from Irish examples.

**Why it is not urgent:** the _rule_ generalises — translate a name built from ordinary words, keep one that is not English to begin with or that would calque into a monstrosity. The examples illustrate it rather than define it, and the model applies the principle to names it has not seen.

**Why it should still be fixed:** each world has its own naming problem and its own answer. Neon Warszawa's names are already Polish (Syrenka, Czarna Noc, Praga) and must therefore _not_ be translated when the campaign language is Polish — the opposite of the Tréigthe case, where Irish names stay put and English epithets translate. The Drift's coined terms (the Severance, the Lattice, the Static, the Ember) sit somewhere between: ordinary English words used as proper nouns, where the right answer is per-term rather than per-rule.

**Fix:** add `namingExamples` (or a short `namingGuidance` string) to `WorldDefinitionSchema`, populate it per world, and turn `NARRATIVE_RULES` into `buildNarrativeRules(world)`. The rest of the block is genuinely world-agnostic and stays as it is.

**Trigger:** the first session played in Polish in The Drift or Neon Warszawa. If the model handles the names cleanly there, this stays deferred; if it starts translating Syrenka or declining "the Static" into something unreadable, it moves up.

## 15. 🔲 Player notebook in the session screen

**Idea:** a persistent, player-authored notes panel in the game screen — a place to record NPC names, rumours, unresolved threads and intentions ("go back to the smith in Cathair Luaith"). In solo tabletop play this is what the paper notepad next to the table does; QuestMind currently has no equivalent, and the chat log is the only place that information lives.

**Why the chat log is not enough:** it is chronological and unsearchable. A session past ~40 exchanges buries an NPC name mentioned once in turn 6 under thousands of tokens of narrative the player has already read. The information is present but not retrievable, which is functionally the same as absent.

**Why it was deferred:** it maps to no FR or NFR in the requirements specification. Adding it before submission would spend the visual-layer and testing weeks on scope that the report cannot claim delivery credit for, at the cost of the styling pass that every screen — the chat screen especially — visibly needs.

**Two versions, and the distance between them is the whole point:**

1. **Local notebook** — a textarea persisted per campaign, invisible to the model. Small: one column (or one table, if entries are to be discrete and timestamped), one panel, autosave. No prompt surface, no schema risk.
2. **Notebook the GM can read** — notes injected into the system prompt as declared player intent and player-held knowledge. This is a different feature. It touches `buildSystemPrompt`, competes for the same token budget the lore resolver already spends 1,500–2,500 tokens of, and hands the model a free-form, player-controlled text channel directly into its instructions — which is a prompt-injection surface as much as a gameplay one ("the smith gives me his sword").

The temptation once (1) exists is to slide into (2). That slide is the actual risk, because it lands on the prompt and validation path late, after the state pipeline is stable and tested.

**Where it connects to work already done:** the FR-006 token measurements (Drift session: 4,738 → 11,829 input tokens over 14 turns, ~546/turn) established that full history fits comfortably inside the 200k window and that cost, not context, is the practical limit. A player notebook is the interesting counter-proposal to full history: a compressed, human-curated summary of what matters, at a fraction of the tokens — and unlike automatic summarisation, the compression is done by the person who knows which details were significant. Worth stating in **Further Development** as the natural continuation of that finding rather than as a UI nicety.

**Trigger:** post-submission, and only in version (1) first. Version (2) should not be attempted until the state block has migrated to tool use (item 11), since that is what makes the prompt path safe to extend.

## 16. ✅ World lore modal: from three paragraphs to a reference

**The problem, in the player's words:** "I start a session and I have no idea what is going on, where anything is, or why." The modal showed a world summary, a region description and a timeline. Nothing about who you can be, what the trades do, where you can go, or what any of the world's vocabulary means — and every world runs on vocabulary the player has never seen (the echo, the Static, Czarna Noc, the brygady).

**Delivered:** a table of contents under the map, then World, History, Peoples, Trades, Places and Glossary. Reachable from the campaign card and from the session screen, via an optional `trigger` render-prop so one component serves both.

**The architectural point worth making in the report:** almost none of this is authored twice.

- Peoples and Trades render from `getWorld(slug).races/.classes` — the same objects the character wizard reads, so the modal cannot describe a race the player cannot create.
- Places render from `locationsTable`, using `promptContext`, which is already written as prose for someone who lives there. A location added to a seed appears in the modal on the next load.
- Only the glossary is new content, and it lives in the world registry beside the definitions.

This is the same principle that fixed the hard-coded scene list and the dead `prompt.intro` field: **a static copy of data that has a live source will drift, and the drift is always found late.** Three occurrences in this project, each fixed the same way.

**Sequencing note:** the modal was written before verifying whether the events query filtered secrets. It does — `isTierSecret: false` and `includeInPrompt: true` — so the AI-only Imprisonment Pact and both "possible future" endings were never exposed. The check should have preceded the assumption.

## 17. 🔲 Ability costs are not calibrated to the HP scale

`calculateMaxHp` is `BASE_HP (50) + endurance × HP_PER_ENDURANCE (10)`, so an ordinary starting character sits near 190 HP. Bleeder's `Bloodcast` costs a flat 5 HP and `Crimson Echo` 8.

That is 2.6% and 4.2% of the pool. The design intent — stated in the class comment, the world core and the glossary alike — is that _nothing is free_ and every working costs the caster something real. At this scale it costs almost nothing, and the same holds for the Diver and the Conduit, whose costs mirror the Bleeder's exactly.

**Two ways out:**

1. **Compress the HP scale** — e.g. `BASE_HP 20`, `HP_PER_ENDURANCE 3` puts a starting character near 62 HP and Bloodcast at ~8%.
2. **Express costs as a fraction of `maxHp`** rather than as flat integers, so the price scales with progression instead of thinning out at higher levels. This is the better answer, and it is also a contract change: the prompt states costs to the model in absolute numbers.

**Why deferred:** balance work needs several played sessions to evaluate, not a reasoning exercise, and it touches three classes across three worlds simultaneously. The mechanic is implemented and demonstrably functional — HP is deducted, the snapshot reflects it, the panel shows it. What is unfinished is the _number_, which is honest to state as such.

**Worth saying plainly in Conclusions:** this is a game-design gap, not a software one, and it is the kind of thing that only surfaces from playing the thing rather than building it.

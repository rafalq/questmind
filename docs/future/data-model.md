# Future Work — Data Model & Deferred Features

Decisions consciously deferred to ship the academic build by Aug 7. None of these are bugs; each is a scoped design choice with a known trigger point for when it should be revisited.

## 1. Campaign should reference `world`, not `genre`

**Current state:** `campaignsTable` stores `genre` (pgEnum). The starting location for RAG is resolved via `getStartingLocationByGenre()`, which works only because there is exactly one enabled world per genre.

**Problem:** the moment a second enabled world shares a genre (e.g. two fantasy worlds), genre→world becomes ambiguous. `resolveLore` picks a world by `eq(worldsTable.genre, genre)` and would return an arbitrary match. The character↔campaign guard in `create-session.ts` compares `genre`, so it would also wrongly allow a mismatched pair.

**Fix:** add `world` (text, slug) to `campaignsTable`, derive `genre` via `getWorld(world).genre`. Touches ~20 read sites (see grep on `.genre`), plus the New Campaign form and the session guard. Do this when adding the second world (The Drift), because that is when the ambiguity first bites.

## 2. Multi-genre worlds (SaaS)

**Idea:** a single world usable across genres — e.g. an AD&D-style setting run as fantasy in one campaign and cyberpunk in another.

**Consequence:** breaks the assumption "one world = one genre." `genre` can no longer be derived from the world, because the world has no single genre. `genre` must then become an explicit per-campaign choice (a column again), independent of world. This directly contradicts item 1's "derive genre from world" — so if this path is taken, genre stays a stored campaign attribute, and a guard validates allowed (world, genre) pairs from the registry.

## 3. Scale / SaaS denormalization

**Trigger:** thousands of campaigns per user with paginated genre filtering.

At that scale, derived genre (filtering in JS after fetch) is too slow — want `WHERE genre = ? LIMIT ? OFFSET ?` in SQL with an index. Keep `genre` as a denormalized column on the campaign, computed from the world at insert time. Not needed at current scale (handful of campaigns per user, already filtered client-side).

## 4. AI-generated character backstory

**Idea:** at the end of character creation, the AI generates 3 world-consistent origin stories for the player to choose from, based on world/race/class. Replaces the removed free-text backstory field, which allowed off-world input and had no gameplay effect.

**Brings back:** the `backgroundStory` column (dropped in this build) and the backstory section in `buildPlayerBlock`. New wizard step + one Claude API call during creation + loading state. Strong demo/report point: "AI-authored, world-consistent character origins."

## 5. Dynamic RAG write layer (steps 3–4 of the lore system)

**Current state:** the read side works end-to-end (resolver + relations + starting-location seeding). `GameSnapshot` carries `npcMet` and `location` hooks, but nothing consumes them yet.

**Remaining:**

- `npcMet` → append to `campaignLoreState.metNpcIds` after each turn, for cross-campaign NPC memory (the world remembers who the player has met).
- `location` → update `campaignLoreState.currentLocationSlug` when the player moves, driving scene-image selection in the chat panel.

This is what turns B-lite RAG (static starting location) into full dynamic RAG (world follows the player).

## 6. Campaign language selection --- DONE! ---

**Current state:** `language-section.ts` exists but is not wired into the live (folder) builder — no importer. Written when the plan targeted the old flat builder; never re-pointed after the switch to the async RAG builder.

**Remaining:** wire `buildLanguageSection` into `build-system-prompt/index.ts`, add a language dropdown to the New Campaign form, add a `language` column to the campaign. Per-font script fallbacks for non-Latin languages already handled in `layout.tsx` / `globals.css`.

## 7. Encumbrance / carry capacity

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

## Visual layer: scene, NPC, avatar and world imagery

**Status:** partially scaffolded, not consumed. Several fields already exist and are populated every turn; nothing renders them yet.

### 1. Scene illustrations (`sceneTag`) — half built

`GameSnapshot.sceneTag` already exists and the GM emits it on every turn, constrained to a fixed enum (`city_square`, `tavern`, `port`, `forest`, `bog`, `mountain_pass`, `tomb_entrance`, `tomb_interior`, `castle_cliff`, `excavation`, `battle`, `camp_night`, `default`). The system prompt already states it exists "so the UI can pick a background" — but no UI consumes it.

**Why a fixed enum, not free-form:** images are pre-generated (Leonardo.ai) and must resolve to a file that exists. A free-form tag would produce `sceneTag: "a windswept ossuary at dusk"` and a 404. The enum is the contract between what the model may say and what the asset folder contains.

**To finish:**

- Asset set per world: `/images/{genre}/{world}/scenes/{sceneTag}.jpg`
- Render inside the GM message, not in the panel — the image belongs to the turn that produced it, and should scroll away with it.
- Render only on _change_: repeating the tavern image for six consecutive tavern turns is noise. Compare against the previous message's snapshot, exactly as `diffSnapshots` already does for hp/inventory/quests.
- Enum lives per world. Neon Warszawa's scenes are not Tréigthe's; the tag list must move into `WorldDefinitionSchema` rather than staying hardcoded in the shared GM instructions.

### 2. NPC portraits (`npcTag`) — not started

`npc_met: string[]` is already in the JSON contract and the GM populates it, but it carries _names_, not tags — and names are free-form, so they can't resolve to assets.

A parallel `npcTag` (enum, same discipline as `sceneTag`) would let a portrait appear when a significant NPC enters a scene. Likely shape: archetype-based (`priest`, `smuggler`, `warden`, `beggar`, `soldier`) rather than per-character, since generating a unique portrait for every improvised NPC is not tractable.

Open question: archetype portraits risk visual repetition — two different priests, one face. May be better limited to _authored_ NPCs (scenario-defined, where a specific portrait can exist) and omitted entirely for improvised ones.

### 3. Character avatar (`avatarUrl`) — column exists, always null

`charactersTable.avatarUrl` exists and `createCharacter` explicitly writes `null` to it. Meanwhile the portrait convention is already fully working elsewhere: `buildClassPortraitUrl` resolves `{race}-{gender}-{class}.jpg` against `WorldDefinition.classPortraitsBaseUrl`, and the wizard displays it.

So the character _has_ a portrait — it is just derived at render time rather than stored.

**Decision to make:** either

- drop the `avatarUrl` column and keep deriving from race/gender/class (simpler, no dead column), or
- populate it at creation, which only makes sense if avatars will one day be user-uploaded or per-character generated rather than per-combination.

Until one of those is true, the column is dead weight. It should be shown in the stats panel regardless — the panel currently names the character but shows no face, which is a missed opportunity in a game about identity.

### 4. World card backgrounds — not started

`WorldDefinitionSchema` has no image field. World selection cards (StepWorld, and the New Campaign form) are text-only.

Proposed: `cardImageUrl` on the world definition, rendered as a darkened background behind the card title and subtitle — dark enough that Cinzel stays legible without a scrim hack (target: text contrast ≥ 4.5:1 over the darkened image, not over the raw one).

This matters more than it sounds: the three worlds are the product's core differentiator, and they currently look like three paragraphs. A grimdark Celtic ruin, a drifting hull and a neon-wet Warsaw street sell the choice instantly in a way prose does not.

### Cross-cutting: assets are per world

All four items resolve through the world registry, not through global paths. `classPortraitsBaseUrl` already establishes this pattern — scenes, NPC portraits and card art should follow it rather than introducing a second, parallel convention.

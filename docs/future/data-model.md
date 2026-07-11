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

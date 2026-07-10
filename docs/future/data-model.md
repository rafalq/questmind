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

## 6. Campaign language selection

**Current state:** `language-section.ts` exists but is not wired into the live (folder) builder — no importer. Written when the plan targeted the old flat builder; never re-pointed after the switch to the async RAG builder.

**Remaining:** wire `buildLanguageSection` into `build-system-prompt/index.ts`, add a language dropdown to the New Campaign form, add a `language` column to the campaign. Per-font script fallbacks for non-Latin languages already handled in `layout.tsx` / `globals.css`.

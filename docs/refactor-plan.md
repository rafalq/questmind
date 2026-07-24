# Refactor plan

Working notes for an in-progress refactor of `src/`. Etap 1 i 2 sa zrobione i
zacommitowane; reszta to kolejka.

## Zrobione

### Etap 1 - `app/`
| Commit | Co |
|---|---|
| `chore(app)` | martwe galezie placeholderow, komentarze na EN |
| `refactor(app)` | `layout.tsx` 76 -> 29; `styles/fonts.ts`, `components/common/theme-script.tsx` |
| `refactor(app)` | `components/marketing/{cta-section,section-eyebrow,section-header}.tsx` |
| `refactor(app)` | About czyta swiaty z rejestru `WORLDS` |
| `refactor(app)` | `DashboardSection`; naprawa dwoch `<h1>` i `min-h-screen` na auth |
| `refactor(api)` | `streamOpeningResponse` + `getClassDef`; route 203 -> 84 |
| `refactor(api)` | `debug-xp.ts` + walidacja Zod; route 127 -> 90 |

### Etap 2 - petla tury
`stream-game-response.ts` 437 -> 121. Rozbite na `build-turn-request.ts`,
`separator-stream.ts`, `extract-snapshot.ts`, `apply-turn-effects.ts`,
`persist-turn.ts`. Jeden klient Anthropic w `lib/ai/client.ts`.

### Etap 3 - dialogi
`components/ui/modal.tsx` + `hooks/use-expandable-set.ts`. Trzy dialogi
przepiete: character sheet, world lore, confirm delete. Naprawione: martwy
wpis History w spisie tresci lore, brak a11y w ConfirmDialog, brak powrotu
focusa, brak blokady scrolla tla.

### Etap 4 - sesja, seed, koszty zdolnosci
- `game-screen.tsx` 413 -> 128. `use-game-session.ts`, `use-side-panel.ts`,
  `session-header.tsx`.
- `db/seed/env.ts` - naprawa kolejnosci ladowania dotenv (bylo zalezne od
  transpilacji do CJS przez tsx).
- `features/character/lib/ability-cost.ts` - koszty narracyjne byly niewidoczne
  w calym UI.

## Kolejka

### 3. ~~Prymityw modala~~ ZROBIONE
`features/lore/components/world-lore-modal.tsx` (554) i
`features/character/components/display/character-detail-modal.tsx` (334) maja
kazdy wlasna kopie tego samego: backdrop, `ModalHeader`, `useId`, focus trap w
`useRef`, `useEffect` na Escape, blokada scrolla.

Zrobic `components/ui/modal.tsx` (`<Modal open onClose title>`), oba modale na
nim oprzec. Sprawdzic przy okazji, czy focus wraca na trigger po zamknieciu -
w obu wygladalo to na niedokonczone.

### 4. Rozbicie `world-lore-modal.tsx`
Po kroku 3 zostanie ~12 komponentow sekcji w jednym pliku: `WorldSection`,
`RegionSection`, `TimelineSection`, `LoreEntry`, `PeoplesSection`,
`TradesSection`, `PlacesSection`, `GlossarySection`, `MapImage`,
`TableOfContents`. Do `features/lore/components/sections/`, jeden plik na
sekcje, `world-lore-modal.tsx` zostaje jako zlozenie + `SECTIONS`.

### 5. ~~Hook `useExpandableSet`~~ ZROBIONE
Trafil do `hooks/use-expandable-set.ts` obok istniejacego `use-filter.ts`.

### 6. ~~`game-screen.tsx`~~ ZROBIONE

### 7. `stats-panel.tsx` (387)
Cztery sekcje w jednym pliku, ten sam wzorzec co lore modal. Rozbic na
`features/session/components/stats/`.

### 8. Seed - dane vs mechanizm (po 7 sierpnia)
Tanie punkty (1) i (3) ponizej sa juz zrobione. Zostaje idempotencja i sam
podzial dane/mechanizm.

NIE dzielic po encjach (`npcs.ts`, `sublocations.ts`) - to skrypty
imperatywne, w ktorych klucz obcy wymusza kolejnosc; podzial po tabelach
zamienia dlugi plik na rozproszony problem kolejnosci. Ciac wzdluz danych vs
mechanizmu: `db/seed/data/<world>.ts` jako czysty literal + jeden
`db/seed/run-seed.ts`, ktory wstawia drzewo i przewleka ID. `praga.ts`,
`tetherport.ts`, `baile-fola.ts` to trzy kopie tego samego skryptu (9
insertow, 12 awaitow kazdy).

Tanie teraz: (1) komentarz mowi `src/db/seeds/`, folder to `src/db/seed/` -
zla instrukcja x6; (2) brak idempotencji, ponowny run duplikuje swiat;
(3) `config({ path: '.env.local' })` na gorze kazdego z 6 plikow.

### 9. Drobne
- ~~Siatka atrybutow w `character-detail-modal.tsx` vs `summary-panel.tsx`~~ -
  SPRAWDZONE, NIE dublowana. Summary to lista klucz-wartosc przed stworzeniem
  postaci, liczona z point-buy + modyfikatorow; AttributeGrid to kafelkowa
  siatka po stworzeniu, liczona z `effectiveAttributes()` ze wzrostem na
  poziom. Inne dane, inny uklad, inny cel. Wspolny komponent bylby zla
  abstrakcja. Nie wracac do tego.
- `worlds/*/definition.ts` (3x ~700) i `db/seed/*` - to dane. Nie ruszac.

### 10. Swiadomie NIE zrobione
`world-lore-modal.tsx` (513) i `stats-panel.tsx` (370) zostaja w jednym pliku.
Obydwa to "dlugi, ale spojny plik": sekcje sa male, uzywane wylacznie razem i
uloz one w kolejnosci czytania (`SECTIONS`). Jedyny argument za podzialem to
liczba linii, co jest najslabszym powodem. Jesli ktores z nich zacznie byc
uzywane osobno - wtedy dzielic.

## Do zweryfikowania (nie sprawdzone kompilatorem)

Refaktor byl sprawdzony tylko parserem skladni, bez `tsc` z zaleznosciami.
Przed dalsza praca uruchomic `npx tsc --noEmit` i `npm run build`. Punkty
najwyzszego ryzyka:

1. `separator-stream.ts` - `textDelta()` zwaza zdarzenia SDK przez `unknown`.
2. `apply-turn-effects.ts` - `ClassDef` wyprowadzony z `ReturnType<typeof getClassDef>`.
3. `THEME_STORAGE_KEY` - podmienic zahardkodowane `'questmind-theme'` w theme toggle.
4. `app/about/page.tsx` uzywa `world.cardImageUrl` w kadrze `aspect-4/5`.

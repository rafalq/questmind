import { describe, it, expect, vi } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { repairSnapshot, resolveSceneTag } from './snapshot-schema'
import { SCENE_IMAGES } from '@/worlds/schema/scenes'

/**
 * The model authors the game state, so every guarantee about that state is a
 * guarantee this file has to make. The functions under test are pure — no
 * database, no network — which is what makes the turn loop testable at all.
 */

const fallback = {
  hp: 80,
  maxHp: 100,
  inventory: ['Notched Longsword', 'Whetstone'],
  quests: [{ id: 'q1', title: 'Find Maevet', status: 'active' as const }],
  npcMet: [],
  location: null,
  abilityUsed: undefined,
  sceneTag: 'city_square',
}

const validSnapshot = {
  hp: 65,
  maxHp: 100,
  inventory: ['Notched Longsword'],
  quests: [{ id: 'q1', title: 'Find Maevet', status: 'completed' as const }],
  npcMet: ['Máthair Liath'],
  location: 'baile-fola',
  sceneTag: 'tavern',
}

describe('repairSnapshot', () => {
  it('passes a well-formed snapshot through untouched', () => {
    const onRepair = vi.fn()
    const result = repairSnapshot(validSnapshot, fallback, onRepair)

    expect(onRepair).not.toHaveBeenCalled()
    expect(result).toMatchObject(validSnapshot)
  })

  it('accepts a missing abilityUsed without reporting a repair', () => {
    // The prompt says to omit the field; the model often sends null instead.
    // Both are "no ability was used" and neither is a fault worth logging.
    const onRepair = vi.fn()

    repairSnapshot({ ...validSnapshot, abilityUsed: null }, fallback, onRepair)
    repairSnapshot(validSnapshot, fallback, onRepair)

    expect(onRepair).not.toHaveBeenCalled()
  })

  it('reverts a single malformed field and keeps the rest of the turn', () => {
    // The failure this whole module exists for: valid JSON, wrong shape.
    // JSON.parse is perfectly happy with an inventory that is a string.
    const onRepair = vi.fn()
    const result = repairSnapshot(
      { ...validSnapshot, inventory: 'a sword and a whetstone' },
      fallback,
      onRepair
    )

    expect(onRepair).toHaveBeenCalledWith(
      'inventory',
      'a sword and a whetstone'
    )
    expect(result?.inventory).toEqual(fallback.inventory)

    // The point of per-field recovery: one bad field must not cost the turn.
    expect(result?.hp).toBe(65)
    expect(result?.quests).toEqual(validSnapshot.quests)
  })

  it('rejects a quest with an unknown status', () => {
    const onRepair = vi.fn()
    const result = repairSnapshot(
      {
        ...validSnapshot,
        quests: [{ id: 'q1', title: 'Find Maevet', status: 'abandoned' }],
      },
      fallback,
      onRepair
    )

    expect(onRepair).toHaveBeenCalledWith('quests', expect.anything())
    expect(result?.quests).toEqual(fallback.quests)
  })

  it('preserves server-authoritative fields it does not validate', () => {
    // xp/level/tier are overwritten downstream, but on the first turn they have
    // to survive this pass — there is no previous snapshot to inherit from.
    const result = repairSnapshot(
      { ...validSnapshot, xp: 40, level: 2, tier: 1 },
      fallback,
      vi.fn()
    )

    expect(result).toMatchObject({ xp: 40, level: 2, tier: 1 })
  })

  it('returns null when the payload is not an object', () => {
    // Nothing to salvage field by field, so the turn is dropped like a parse
    // error rather than half-applied.
    expect(repairSnapshot('narrative text', fallback, vi.fn())).toBeNull()
    expect(repairSnapshot([1, 2, 3], fallback, vi.fn())).toBeNull()
    expect(repairSnapshot(null, fallback, vi.fn())).toBeNull()
  })
})

describe('resolveSceneTag', () => {
  const allowed = new Set(['city_square', 'tavern', 'default'])

  it('accepts a tag the world actually has', () => {
    const onReject = vi.fn()
    expect(resolveSceneTag('tavern', allowed, 'city_square', onReject)).toBe(
      'tavern'
    )
    expect(onReject).not.toHaveBeenCalled()
  })

  it('reverts an invented tag to the scene the player was already in', () => {
    // An unknown tag would point the banner at a file that does not exist.
    const onReject = vi.fn()
    expect(
      resolveSceneTag('throne_room', allowed, 'city_square', onReject)
    ).toBe('city_square')
    expect(onReject).toHaveBeenCalledWith('throne_room')
  })

  it('rejects a tag belonging to a different world', () => {
    // neon_street is a real tag — in Neon Warszawa. In Tréigthe it is a
    // hallucination, which is why the allowed set is built per campaign.
    const onReject = vi.fn()
    expect(resolveSceneTag('neon_street', allowed, 'default', onReject)).toBe(
      'default'
    )
  })
})

describe('scene assets', () => {
  it('every mapped scene image exists on disk', () => {
    // A missing file does not throw anywhere: sceneImage returns the path, the
    // browser 404s, and the banner is silently blank. This is the only place
    // that failure is visible before a player sees it.
    const missing: string[] = []

    for (const [genre, scenes] of Object.entries(SCENE_IMAGES)) {
      for (const [tag, path] of Object.entries(scenes)) {
        if (!existsSync(join(process.cwd(), 'public', path))) {
          missing.push(`${genre}/${tag} → ${path}`)
        }
      }
    }

    expect(missing).toEqual([])
  })

  it('every genre defines a default scene', () => {
    // sceneImage falls back to `default` for any unknown tag, so a genre
    // without one has no fallback at all.
    for (const [genre, scenes] of Object.entries(SCENE_IMAGES)) {
      expect(scenes.default, `${genre} has no default scene`).toBeTruthy()
    }
  })
})

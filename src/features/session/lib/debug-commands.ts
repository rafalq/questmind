// src/features/session/lib/debug-commands.ts
// DEV-ONLY. Lets the developer force game-state changes without invoking the
// model, to test the snapshot→panel pipeline (and hunt the FR-005 HP bug)
// deterministically. Hard-gated off in production — see isDebugEnabled().

import { type GameSnapshot } from '@/db/schema/session'

export function isDebugEnabled(): boolean {
  // Two independent gates: must not be production AND must be explicitly on.
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.ENABLE_DEBUG_COMMANDS === 'true'
  )
}

/** True if the message looks like a debug command (leading slash). */
export function isDebugCommand(message: string): boolean {
  return message.trimStart().startsWith('/')
}

// A sane baseline when there's no prior snapshot yet (first turn).
const BASE_SNAPSHOT: GameSnapshot = {
  hp: 100,
  maxHp: 100,
  inventory: [],
  quests: [],
  sceneTag: 'default',
}

type CommandResult = {
  snapshot: GameSnapshot
  feedback: string
}

/**
 * Applies a debug command to the last snapshot and returns the new snapshot
 * plus a short feedback line. Returns null if the command is unrecognised.
 */
export function applyDebugCommand(
  message: string,
  lastSnapshot: GameSnapshot | null
): CommandResult | null {
  const snapshot: GameSnapshot = lastSnapshot
    ? { ...lastSnapshot }
    : { ...BASE_SNAPSHOT }

  const parts = message.trimStart().slice(1).trim().split(/\s+/)
  const cmd = parts[0]?.toLowerCase()

  switch (cmd) {
    case 'set': {
      const target = parts[1]?.toLowerCase()
      const value = Number(parts[2])
      if (!Number.isFinite(value)) return null

      if (target === 'hp') {
        snapshot.hp = value
        return { snapshot, feedback: `[debug] hp set to ${value}` }
      }
      if (target === 'maxhp') {
        snapshot.maxHp = value
        return { snapshot, feedback: `[debug] maxHp set to ${value}` }
      }
      return null
    }

    case 'additem': {
      const item = parts.slice(1).join(' ').trim()
      if (!item) return null
      snapshot.inventory = [...snapshot.inventory, item]
      return { snapshot, feedback: `[debug] added "${item}"` }
    }

    case 'removeitem': {
      const item = parts.slice(1).join(' ').trim()
      if (!item) return null
      snapshot.inventory = snapshot.inventory.filter((i) => i !== item)
      return { snapshot, feedback: `[debug] removed "${item}"` }
    }

    case 'scene': {
      const tag = parts[1]
      if (!tag) return null
      snapshot.sceneTag = tag
      return { snapshot, feedback: `[debug] scene set to "${tag}"` }
    }

    default:
      return null
  }
}

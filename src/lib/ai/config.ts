// src/lib/ai/config.ts

/**
 * Central config for all Anthropic API calls.
 * These are constants (identical across environments). Secrets and
 * per-environment values belong in .env.local, not here.
 */

/** Model identifier. A version bump now touches exactly one line. */
export const AI_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-6'

/**
 * max_tokens per generation path. Separate values because the opening
 * scene and a standard turn have different length needs.
 */
export const MAX_TOKENS = {
  opening: 700,
  turn: 2048,
  // summary: 512, // reserved for a future session-summary pass (FR-006)
} as const

/** Sampling temperature (Anthropic default is 1.0). Keep only if you set it. */
export const TEMPERATURE = {
  opening: 1.0,
  turn: 0.8,
} as const

/** How much session history feeds back into context. Ties to FR-006. */
export const HISTORY = {
  maxMessages: 40,
} as const

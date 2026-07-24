import Anthropic from '@anthropic-ai/sdk'

/**
 * The one Anthropic client the app uses.
 *
 * There were two, constructed differently: the turn loop used `new Anthropic()`
 * and relied on the SDK reading ANTHROPIC_API_KEY from the environment itself,
 * while the opening route passed the key explicitly. Both happen to work, which
 * is what made the difference easy to miss - and it would have stopped being
 * cosmetic the moment either needed a timeout, a retry policy or a base URL,
 * since only one of them would have got it.
 */
export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

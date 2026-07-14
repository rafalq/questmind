import { z } from 'zod'

// ---------------------------------------------------------------------------
// Prompt fragments
// ---------------------------------------------------------------------------

export const WorldPromptSchema = z.object({
  /** Core setting summary injected into buildSystemPrompt. */
  intro: z.string().min(1),
  /** Tone and narration rules (grimdark, noir, etc.). */
  tone: z.string().min(1),
  /** Optional language rules, e.g. Polish/English code-switching. */
  language: z.string().optional(),
})

export type WorldPrompt = z.infer<typeof WorldPromptSchema>

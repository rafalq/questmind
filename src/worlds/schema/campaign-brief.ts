import { z } from "zod";

/**
 * Campaign brief — optional, player-authored outline attached to a campaign.
 *
 * Every field is optional: an empty brief means "use world defaults".
 * Stored as a single jsonb column (`campaign_brief`) on the campaigns table
 * and injected into buildSystemPrompt next to the RAG lore.
 */

// Turns "" and whitespace-only strings into undefined before validation,
// so empty form inputs don't end up as empty strings in the DB.
const optionalTrimmed = (max: number) =>
  z.preprocess(
    (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
    z.string().trim().max(max).optional(),
  );

export const CampaignBriefSchema = z.object({
  /** What the campaign is about, in the player's own words. */
  premise: optionalTrimmed(500),
  /** Desired mood on top of the world's default tone. */
  tone: optionalTrimmed(200),
  /** Where the story starts (overrides the world's default location). */
  startingLocation: optionalTrimmed(120),
  /** Short plot hooks the GM should weave in over time. */
  plotHooks: z
    .array(z.string().trim().min(1).max(200))
    .max(5)
    .default([]),
});

export type CampaignBrief = z.infer<typeof CampaignBriefSchema>;

/** True when the brief has no usable content — skip storing/injecting it. */
export function isBriefEmpty(brief: CampaignBrief): boolean {
  return (
    !brief.premise &&
    !brief.tone &&
    !brief.startingLocation &&
    brief.plotHooks.length === 0
  );
}

/**
 * Serializes the brief into a system prompt fragment.
 * Only non-empty fields are included. Returns null for an empty brief
 * so the caller can simply skip the section.
 */
export function briefToPromptFragment(
  brief: CampaignBrief | null | undefined,
): string | null {
  if (!brief || isBriefEmpty(brief)) return null;

  const lines: string[] = [
    "## Campaign brief (player-authored)",
    "The player provided the outline below when creating this campaign.",
    "Honor it within the world's rules and tone system — it customizes",
    "the story, it does not override world mechanics or the TIER SECRET system.",
    "",
  ];

  if (brief.premise) lines.push(`Premise: ${brief.premise}`);
  if (brief.tone) lines.push(`Tone: ${brief.tone}`);
  if (brief.startingLocation) {
    lines.push(`Starting location: ${brief.startingLocation}`);
  }
  if (brief.plotHooks.length > 0) {
    lines.push("Plot hooks to weave in gradually:");
    for (const hook of brief.plotHooks) lines.push(`- ${hook}`);
  }

  return lines.join("\n");
}

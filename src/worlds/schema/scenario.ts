// ---------------------------------------------------------------------------
// Scenarios — predefined campaign briefs offered in the New Campaign form
// ---------------------------------------------------------------------------

import z from 'zod'
import { CampaignBriefSchema } from '../schema/'

export const ScenarioSchema = z.object({
  id: z.string().min(1),
  /** Name shown in the scenario dropdown, e.g. "The Stolen God". */
  label: z.string().min(1),
  /** Prefilled brief the player can edit before creating the campaign. */
  brief: CampaignBriefSchema,
})

export type Scenario = z.infer<typeof ScenarioSchema>

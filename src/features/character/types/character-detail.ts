import { Genre } from '@/worlds/schema/primitives'

// ─── Types ───────────────────────────────────────────────────────────────────

/**
 * A row as it comes out of characterAttributesTable. Not to be confused with
 * Attribute (the key: 'mind', 'strength', ...) imported from the registry.
 * `value` is baseValue: point-buy plus race, class and gender modifiers,
 * WITHOUT per-level growth, which is derived on read.
 */
type AttributeRow = {
  attributeName: string
  value: number
}

type ActiveCampaign = {
  campaignId: string | null
  campaignName: string
  currentHp: number
  maxHp: number
  sessionId: string
}

export type CharacterDetail = {
  id: string
  name: string
  genre: Genre
  world: string
  race: string
  characterClass: string
  characterXp: number
  isAlive: boolean
  inventory: string[]
  attributes: AttributeRow[]
  activeCampaign: ActiveCampaign | null
}

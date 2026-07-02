import type { RaceDefinition, ClassDefinition } from './shared'
import type { World } from './worlds'
import {
  TREIGTHE_RACES,
  TREIGTHE_CLASSES,
  TREIGTHE_ATTRIBUTE_LABELS,
  type TreigtheRace,
  type TreigtheClass,
} from './fantasy/treigthe'

export * from './shared'
export * from './worlds'
export * from './gender'

export type Race = TreigtheRace
export type CharacterClass = TreigtheClass

export const RACES_BY_WORLD: Record<World, RaceDefinition<Race>[]> = {
  treigthe: TREIGTHE_RACES,
}

export const CLASSES_BY_WORLD: Record<
  World,
  ClassDefinition<CharacterClass>[]
> = {
  treigthe: TREIGTHE_CLASSES,
}

export const ATTRIBUTE_LABELS_BY_WORLD: Record<
  World,
  Record<string, string>
> = {
  treigthe: TREIGTHE_ATTRIBUTE_LABELS,
}

import type {
  World,
  Race,
  CharacterClass,
  Attribute,
} from '@/features/character/constants'

export type FormData = {
  name: string
  world: string | null
  race: string | null
  gender: 'male' | 'female' | null
  characterClass: string | null
  attributes: Record<Attribute, number>
}

export const DEFAULT_ATTRIBUTES: Record<Attribute, number> = {
  strength: 10,
  mind: 10,
  endurance: 10,
  agility: 10,
  charisma: 5,
  perception: 5,
}

export const ATTRIBUTES: Attribute[] = [
  'strength',
  'mind',
  'endurance',
  'agility',
  'charisma',
  'perception',
]

export type StepId =
  | 'world'
  | 'race'
  | 'sex'
  | 'class'
  | 'attributes'
  | 'summary'

export const ALL_STEPS: { id: StepId; label: string }[] = [
  { id: 'world', label: 'World' },
  { id: 'race', label: 'Race' },
  { id: 'sex', label: 'Sex' },
  { id: 'class', label: 'Class' },
  { id: 'attributes', label: 'Attributes' },
  { id: 'summary', label: 'Summary' },
]

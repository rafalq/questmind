import type {
  Genre,
  Race,
  CharacterClass,
  Attribute,
} from '@/features/character/constants'

export type FormData = {
  name: string
  genre: Genre | null
  race: Race | null
  characterClass: CharacterClass | null
  backgroundStory: string
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

export const STEPS = ['Basics', 'Race', 'Class', 'Attributes', 'Story']

import type { WorldDefinitionInput } from '../schema'

/**
 * The Drift (The Unmoored) — sci-fi world.
 * STUB: placeholder data so the registry validates. Fill in during the
 * sci-fi schema update, then flip `enabled` to true.
 */
export const drift: WorldDefinitionInput = {
  value: 'drift',
  genre: 'sci-fi', // matches Genre in shared.ts (hyphenated)
  name: 'The Drift',
  subtitle: 'The Unmoored',
  description: 'TODO: full world description for The Drift.',

  // TODO: rename attributes to fit the sci-fi flavour
  attributeLabels: {
    strength: 'Strength',
    mind: 'Mind',
    endurance: 'Endurance',
    agility: 'Agility',
    charisma: 'Charisma',
    perception: 'Perception',
  },

  // TODO: adjust labels/modifiers for this world
  genderOptions: [
    { id: 'female', label: 'Female', statModifiers: {} },
    { id: 'male', label: 'Male', statModifiers: {} },
  ],

  races: [
    {
      value: 'todo_race',
      label: 'TODO',
      description: 'Placeholder race until the sci-fi schema is finalised.',
      modifiers: {},
      genderless: false,
      femalePortraitUrl:
        '/images/sci-fi/drift/characters/races/todo-female.jpg',
      malePortraitUrl: '/images/sci-fi/drift/characters/races/todo-male.jpg',
    },
  ],

  classes: [
    {
      value: 'todo_class',
      label: 'TODO',
      description: 'Placeholder class until the sci-fi schema is finalised.',
      modifiers: {},
    },
  ],

  classPortraitsBaseUrl: '/images/sci-fi/drift/characters/classes/',

  prompt: {
    intro: 'You are the Game Master of The Drift, a sci-fi setting. TODO.',
    tone: 'TODO: tone rules for The Drift.',
  },

  enabled: false, // greyed out in the wizard until content is ready
}

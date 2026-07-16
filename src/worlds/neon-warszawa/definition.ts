import type { WorldDefinitionInput } from '../schema'

/**
 * Neon Warszawa 2087 — cyberpunk world.
 * STUB: placeholder data so the registry validates. Fill in during the
 * cyberpunk schema update, then flip `enabled` to true. Note `language` —
 * this is where the Polish/English code-switching rules live.
 */
export const neonWarszawa: WorldDefinitionInput = {
  // Underscore to match the naming sketched in worlds.ts ('neon_warszawa').
  // Decide once before anything lands in the DB `world` column.
  value: 'neon_warszawa',
  genre: 'cyberpunk',
  name: 'Neon Warszawa',
  subtitle: '2087',
  description: 'TODO: full world description for Neon Warszawa 2087.',
  cardImageUrl: '/images/cyberpunk/neon-warszawa/cyberpunk-hero.jpg',
  // TODO: rename attributes to fit the cyberpunk flavour
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
      description: 'Placeholder race until the cyberpunk schema is finalised.',
      modifiers: {},
      genderless: false,
      femalePortraitUrl:
        '/images/cyberpunk/neon-warszawa/characters/races/todo-female.jpg',
      malePortraitUrl:
        '/images/cyberpunk/neon-warszawa/characters/races/todo-male.jpg',
    },
  ],

  classes: [
    {
      value: 'todo_class',
      label: 'TODO',
      description: 'Placeholder class until the sci-fi schema is finalised.',
      modifiers: {},
      keyAttribute: 'mind',
      growth: { primary: 'mind', secondary: 'endurance' },
      abilities: [],
    },
  ],

  classPortraitsBaseUrl: '/images/cyberpunk/neon-warszawa/characters/classes/',

  prompt: {
    intro:
      'You are the Game Master of Neon Warszawa 2087, a cyberpunk vision of ' +
      'Warsaw. TODO.',
    tone: 'TODO: tone rules for Neon Warszawa.',
    language:
      'Narration mixes Polish and English naturally (code-switching): street ' +
      'slang and dialogue lean Polish, corporate and tech vocabulary leans ' +
      'English.',
  },

  enabled: false,
}

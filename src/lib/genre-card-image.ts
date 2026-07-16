import type { Genre } from '@/worlds'

/**
 * TEMPORARY genre → card background mapping.
 *
 * Campaigns store only `genre` (no `world` column yet), so their cards can't
 * resolve an image through the world registry the way character cards do.
 * This bridges that gap until the genre→world refactor lands, at which point
 * campaign cards switch to getWorld(campaign.world).cardImageUrl and this file
 * is deleted.
 *
 * 1:1 today because each genre has exactly one enabled world. The moment a
 * second world shares a genre this mapping is wrong by construction — which is
 * the intended pressure to finish the world column on campaigns.
 */
const GENRE_CARD_IMAGE: Record<Genre, string> = {
  fantasy: '/images/fantasy/treigthe/fantasy-hero.jpg',
  'sci-fi': '/images/sci-fi/drift/sci-fi-hero.jpg',
  cyberpunk: '/images/cyberpunk/neon-warszawa/cyberpunk-hero.jpg',
}

export function genreCardImage(genre: Genre): string {
  const url = GENRE_CARD_IMAGE[genre]
  if (!url) throw new Error(`No card image mapped for genre "${genre}"`)
  return url
}

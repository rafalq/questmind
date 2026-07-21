import type { Genre } from '@/worlds'
import { IconCpu, IconRocket, IconTower } from '@tabler/icons-react'

export const genreFont: Record<Genre, string> = {
  fantasy: 'var(--font-im-fell)',
  'sci-fi': 'var(--font-exo2)',
  cyberpunk: 'var(--font-share-tech-mono)',
}

/*
 * genreBg used to live here as a single hex value per genre, applied as an
 * inline backgroundColor. Inline styles sit outside the token system, so every
 * surface using it — chat panel, cards, both modals — stayed dark when the
 * theme toggle switched to light, while the text on top of it turned dark too.
 *
 * The tint is now --qm-bg-genre in globals.css, with a value per genre per
 * theme, scoped by a data-genre attribute. Usage:
 *
 *   <div data-genre={genre} className="bg-bg-genre">
 *
 * The font stays here because a typeface does not change with the theme.
 */

// prywatna mapa — na zewnątrz używaj <GenreIcon>, nie surowej mapy
const genreIconMap: Record<Genre, React.FC<{ size?: number }>> = {
  fantasy: IconTower,
  'sci-fi': IconRocket,
  cyberpunk: IconCpu,
}

export function GenreIcon({
  genre,
  size = 14,
}: {
  genre: Genre
  size?: number
}) {
  const Icon = genreIconMap[genre]
  return <Icon size={size} />
}

export const genreLabel: Record<Genre, string> = {
  fantasy: 'Fantasy',
  'sci-fi': 'Sci-Fi',
  cyberpunk: 'Cyberpunk',
}

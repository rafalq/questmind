import { IconSword, IconRocket, IconCpu } from '@tabler/icons-react'
import type { Genre } from '@/worlds'

export const genreFont: Record<Genre, string> = {
  fantasy: 'var(--font-im-fell)',
  'sci-fi': 'var(--font-exo2)',
  cyberpunk: 'var(--font-share-tech-mono)',
}

export const genreBg: Record<Genre, string> = {
  fantasy: '#1a1208',
  'sci-fi': '#080f1a',
  cyberpunk: '#12081a',
}

// prywatna mapa — na zewnątrz używaj <GenreIcon>, nie surowej mapy
const genreIconMap: Record<Genre, React.FC<{ size?: number }>> = {
  fantasy: IconSword,
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

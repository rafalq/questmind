import { IconSword, IconRocket, IconCpu } from '@tabler/icons-react'
import type { Genre } from '@/worlds/'

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

export const genreIcon: Record<Genre, React.FC<{ size?: number }>> = {
  fantasy: IconSword,
  'sci-fi': IconRocket,
  cyberpunk: IconCpu,
}

// helper to get an icon element for a genre
export const getGenreIcon = (genre: Genre, size = 14) => {
  const Icon = genreIcon[genre]
  return <Icon size={size} />
}

export const genreLabel: Record<Genre, string> = {
  fantasy: 'Fantasy',
  'sci-fi': 'Sci-Fi',
  cyberpunk: 'Cyberpunk',
}

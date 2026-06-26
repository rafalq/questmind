import { IconSword, IconRocket, IconCpu } from '@tabler/icons-react'
import type { Genre } from '@/features/character/constants'

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

export const genreIcon: Record<Genre, React.ReactNode> = {
  fantasy: <IconSword size={14} />,
  'sci-fi': <IconRocket size={14} />,
  cyberpunk: <IconCpu size={14} />,
}

export const genreLabel: Record<Genre, string> = {
  fantasy: 'Fantasy',
  'sci-fi': 'Sci-Fi',
  cyberpunk: 'Cyberpunk',
}

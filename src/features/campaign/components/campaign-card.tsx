import { IconSword, IconRocket, IconCpu } from '@tabler/icons-react'

type Campaign = {
  id: string
  name: string
  genre: 'fantasy' | 'sci-fi' | 'cyberpunk'
  description: string | null
  lastPlayedAt: Date | null
  createdAt: Date
}

const genreFont = {
  fantasy: 'var(--font-im-fell)',
  'sci-fi': 'var(--font-exo2)',
  cyberpunk: 'var(--font-share-tech-mono)',
}

const genreBg = {
  fantasy: '#1a1208',
  'sci-fi': '#080f1a',
  cyberpunk: '#12081a',
}

const genreIcon = {
  fantasy: <IconSword size={14} />,
  'sci-fi': <IconRocket size={14} />,
  cyberpunk: <IconCpu size={14} />,
}

export default function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <div
      className="p-6 border border-border"
      style={{
        fontFamily: genreFont[campaign.genre],
        backgroundColor: genreBg[campaign.genre],
      }}
    >
      <div
        className="flex items-center justify-between gap-1.5 text-xs text-text-muted uppercase tracking-widest mb-4"
        style={{ fontFamily: 'var(--font-rajdhani)' }}
      >
        <div className="flex items-center gap-1">
          {genreIcon[campaign.genre]}
          {campaign.genre}
        </div>
        <p
          className="text-text-muted text-center text-[10px]"
          style={{ fontFamily: 'var(--font-rajdhani)' }}
        >
          {campaign.lastPlayedAt
            ? `Last played: ${new Date(campaign.lastPlayedAt).toLocaleDateString('en-IE')}`
            : 'Never played'}
        </p>
      </div>
      <h2 className="text-lg font-bold text-text-primary">{campaign.name}</h2>
      {campaign.description && (
        <p className="text-sm text-text-secondary mt-2 line-clamp-2">
          {campaign.description}
        </p>
      )}
    </div>
  )
}

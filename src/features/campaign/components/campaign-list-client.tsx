'use client'

import { useFilter } from '@/hooks/use-filter'
import CampaignCard from './campaign-card'
import SearchInput from '@/components/ui/search-input'
import FilterSelect from '@/components/ui/filter-select'
import { WorldLore } from '@/features/lore/queries/get-world-lore'

type Character = {
  id: string
  name: string
  race: string
  characterClass: string
  level: number
}

type ActiveSession = {
  id: string
} | null

type Campaign = {
  id: string
  name: string
  genre: 'fantasy' | 'sci-fi' | 'cyberpunk'
  description: string | null
  lastPlayedAt: Date | null
  createdAt: Date
}

export type EnrichedCampaign = {
  campaign: Campaign
  activeSession: ActiveSession
  availableCharacters: Character[]
  lore: WorldLore | null
}

const genreOptions = [
  { label: 'All Genres', value: 'all' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Sci-Fi', value: 'sci-fi' },
  { label: 'Cyberpunk', value: 'cyberpunk' },
]

export default function CampaignListClient({
  enriched,
}: {
  enriched: EnrichedCampaign[]
}) {
  // useFilter works on the campaign object inside each enriched item
  const { search, setSearch, filter, setFilter, filtered } = useFilter({
    items: enriched,
    searchKey: (item) => item.campaign.name,
    filterKey: (item) => item.campaign.genre,
  })

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search campaigns..."
        />
        <FilterSelect
          value={filter}
          onChange={setFilter}
          options={genreOptions}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-text-muted border border-border">
          <p className="text-lg">No campaigns found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(
            ({ campaign, activeSession, availableCharacters, lore }) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                activeSessionId={activeSession?.id ?? null}
                availableCharacters={availableCharacters}
                lore={lore}
              />
            )
          )}
        </div>
      )}
    </>
  )
}

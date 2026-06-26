'use client'

import { useFilter } from '@/hooks/use-filter'
import CampaignCard from './campaign-card'
import SearchInput from '@/components/ui/search-input'
import FilterSelect from '@/components/ui/filter-select'

type Campaign = {
  id: string
  name: string
  genre: 'fantasy' | 'sci-fi' | 'cyberpunk'
  description: string | null
  lastPlayedAt: Date | null
  createdAt: Date
}

const genreOptions = [
  { label: 'All Genres', value: 'all' },
  { label: 'Fantasy', value: 'fantasy' },
  { label: 'Sci-Fi', value: 'sci-fi' },
  { label: 'Cyberpunk', value: 'cyberpunk' },
]

export default function CampaignListClient({
  campaigns,
}: {
  campaigns: Campaign[]
}) {
  const { search, setSearch, filter, setFilter, filtered } = useFilter({
    items: campaigns,
    searchKey: 'name',
    filterKey: 'genre',
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
          {filtered.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      )}
    </>
  )
}

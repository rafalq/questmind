'use client'

import type { CharacterDetail } from '@/features/character/types/character-detail'
import { useMemo } from 'react'
import { useFilter } from '@/hooks/use-filter'
import CharacterCard from './character-card'
import SearchInput from '@/components/ui/search-input'
import FilterSelect from '@/components/ui/filter-select'

export default function CharacterListClient({
  characters,
}: {
  characters: CharacterDetail[]
}) {
  const { search, setSearch, filter, setFilter, filtered } = useFilter({
    items: characters,
    searchKey: (c) => c.name,
    filterKey: (c) => c.characterClass,
  })

  const classOptions = useMemo(() => {
    const classes = [...new Set(characters.map((c) => c.characterClass))].sort()
    return [
      { label: 'All Classes', value: 'all' },
      ...classes.map((c) => ({ label: c, value: c })),
    ]
  }, [characters])

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search characters..."
          />
        </div>
        <FilterSelect
          value={filter}
          onChange={setFilter}
          options={classOptions}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-text-muted border border-border">
          <p className="text-lg">No characters found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((character) => (
            <CharacterCard key={character.id} character={{ ...character }} />
          ))}
        </div>
      )}
    </>
  )
}

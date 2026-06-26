'use client'

import { useState, useMemo } from 'react'

type FilterConfig<T> = {
  items: T[]
  searchKey: keyof T
  filterKey?: keyof T
}

export function useFilter<T>({ items, searchKey, filterKey }: FilterConfig<T>) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = String(item[searchKey])
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesFilter =
        filter === 'all' || (filterKey && String(item[filterKey]) === filter)

      return matchesSearch && matchesFilter
    })
  }, [items, search, filter, searchKey, filterKey])

  return { search, setSearch, filter, setFilter, filtered }
}

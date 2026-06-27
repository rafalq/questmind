'use client'

import { useState, useMemo } from 'react'

type KeyOrFn<T> = keyof T | ((item: T) => string)

type FilterConfig<T> = {
  items: T[]
  searchKey: KeyOrFn<T>
  filterKey?: KeyOrFn<T>
}

function getValue<T>(item: T, key: KeyOrFn<T>): string {
  if (typeof key === 'function') return key(item)
  return String(item[key])
}

export function useFilter<T>({ items, searchKey, filterKey }: FilterConfig<T>) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = getValue(item, searchKey)
        .toLowerCase()
        .includes(search.toLowerCase())

      const matchesFilter =
        filter === 'all' || (filterKey && getValue(item, filterKey) === filter)

      return matchesSearch && matchesFilter
    })
  }, [items, search, filter, searchKey, filterKey])

  return { search, setSearch, filter, setFilter, filtered }
}

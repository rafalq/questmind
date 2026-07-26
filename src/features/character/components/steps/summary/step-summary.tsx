'use client'

import { useEffect, useMemo } from 'react'
import { getWorld } from '@/worlds'
import type { FormData } from '@/features/character/types/wizard-types'
import NameInput from './name-input'
import CharacterPortrait from '@/features/character/components/steps/class-portrait'
import SummaryPanel from './summary-panel'
import AvatarPicker from '@/features/character/components/steps/avatar/avatar-picker'
import {
  buildAvatarPool,
  defaultAvatarUrl,
} from '@/features/character/lib/avatar-pool'

export default function StepSummary({
  data,
  onChange,
  takenAvatars = [],
}: {
  data: FormData
  onChange: (patch: Partial<FormData>) => void
  /** Portraits already used by this user's other characters (server-fetched). */
  takenAvatars?: string[]
}) {
  // Hooks must run before any early return.
  const pool = useMemo(() => {
    if (!data.world || !data.race) return []
    return buildAvatarPool(data.world, data.race, data.gender, 4)
  }, [data.world, data.race, data.gender])

  const defaultUrl = useMemo(() => {
    if (!data.world || !data.race) return undefined
    return defaultAvatarUrl(data.world, data.race, data.gender)
  }, [data.world, data.race, data.gender])

  const firstFree = pool.find((src) => !takenAvatars.includes(src))

  // Default the portrait once the player reaches Summary. The generic "default"
  // is pre-selected; the player opts into a specific face by clicking one.
  useEffect(() => {
    if (pool.length > 0 && !data.avatarUrl) {
      onChange({ avatarUrl: defaultUrl ?? firstFree ?? pool[0] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pool, defaultUrl, firstFree, data.avatarUrl])

  if (!data.world || !data.race || !data.characterClass) return null

  const world = getWorld(data.world)
  const raceDef = world.races.find((r) => r.value === data.race)
  const classDef = world.classes.find((c) => c.value === data.characterClass)
  const genderDef = data.gender
    ? world.genderOptions.find((g) => g.id === data.gender)
    : null
  const labels = world.attributeLabels

  return (
    <div className="flex flex-col gap-6">
      <CharacterPortrait
        world={data.world}
        race={data.race}
        gender={data.gender}
        characterClass={data.characterClass}
      />

      {pool.length > 0 && (
        <AvatarPicker
          options={pool}
          value={data.avatarUrl ?? null}
          onChange={(src) => onChange({ avatarUrl: src })}
          taken={takenAvatars}
          defaultOption={defaultUrl}
          name={data.name || 'Character'}
        />
      )}

      <NameInput value={data.name} onChange={(name) => onChange({ name })} />
      <SummaryPanel
        data={data}
        world={data.world}
        raceDef={raceDef}
        classDef={classDef}
        genderDef={genderDef}
        labels={labels}
      />
    </div>
  )
}

'use client'

import { useState } from 'react'
import Image from 'next/image'
import { buildPortraitUrl } from '@/features/character/lib/build-portrait-url'
import ClassIconBadge from '@/features/character/components/class-icon-badge'
import type { Race, CharacterClass } from '@/features/character/constants'

export default function ClassPortrait({
  race,
  gender,
  characterClass,
}: {
  race: Race
  gender: string | null
  characterClass: CharacterClass
}) {
  const [failed, setFailed] = useState(false)
  const portraitUrl = buildPortraitUrl(race, gender, characterClass)

  if (failed) {
    return (
      <div className="flex justify-center mb-4">
        <ClassIconBadge characterClass={characterClass} size={96} />
      </div>
    )
  }

  return (
    <div className="flex justify-center mb-4">
      <Image
        src={portraitUrl}
        alt={`${characterClass} portrait`}
        width={160}
        height={252}
        className="object-cover border border-border"
        onError={() => setFailed(true)}
      />
    </div>
  )
}

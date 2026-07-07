'use client'

import { useState } from 'react'
import Image from 'next/image'
import { buildClassPortraitUrl } from '@/worlds'
import ClassIconBadge from '@/features/character/components/class-icon-badge'

export default function ClassPortrait({
  world,
  race,
  gender,
  characterClass,
}: {
  world: string
  race: string
  gender: string | null
  characterClass: string
}) {
  const [failed, setFailed] = useState(false)
  const portraitUrl = buildClassPortraitUrl(
    world,
    race,
    gender as 'male' | 'female' | null,
    characterClass
  )

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

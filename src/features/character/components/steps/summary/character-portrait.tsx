import Image from 'next/image'
import { getPortraitUrl } from '@/features/character/lib/get-portrait-url'
import ClassIconBadge from '@/features/character/components/fantasy/treigthe/class-icons-badge'
import type { Race, CharacterClass } from '@/features/character/constants'

export default function CharacterPortrait({
  race,
  gender,
  characterClass,
}: {
  race: Race
  gender: string | null
  characterClass: CharacterClass
}) {
  const portraitUrl = getPortraitUrl(race, gender, characterClass)

  if (!portraitUrl) {
    // Fallback while the full 28-combination art set is still in progress
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
        alt="Character portrait"
        width={168}
        height={264}
        className="object-cover border border-border"
      />
    </div>
  )
}

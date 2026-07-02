import Image from 'next/image'
import type { RaceDefinition } from '@/features/character/constants'

export default function RacePortraits({ race }: { race: RaceDefinition }) {
  if (race.genderless) {
    return (
      <div className="flex justify-center mb-4">
        {race.portraitUrl && (
          <Image
            src={race.portraitUrl}
            alt={`${race.label} portrait`}
            width={112}
            height={176}
            className="object-cover border border-border"
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex justify-between gap-3 mb-4">
      {race.femalePortraitUrl && (
        <Image
          src={race.femalePortraitUrl}
          alt={`${race.label} female portrait`}
          width={112}
          height={176}
          className="object-cover border border-border"
        />
      )}
      {race.malePortraitUrl && (
        <Image
          src={race.malePortraitUrl}
          alt={`${race.label} male portrait`}
          width={112}
          height={176}
          className="object-cover border border-border"
        />
      )}
    </div>
  )
}

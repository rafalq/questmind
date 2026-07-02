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
            width={120}
            height={188}
            className="object-cover border border-border"
          />
        )}
      </div>
    )
  }

  return (
    <div className="flex justify-center gap-6 mb-4">
      {race.femalePortraitUrl && (
        <div className="flex flex-col items-center gap-1.5">
          <Image
            src={race.femalePortraitUrl}
            alt={`${race.label} female portrait`}
            width={120}
            height={188}
            className="object-cover border border-border"
          />
          <span className="text-xs text-text-muted tracking-wider uppercase">
            Female
          </span>
        </div>
      )}
      {race.malePortraitUrl && (
        <div className="flex flex-col items-center gap-1.5">
          <Image
            src={race.malePortraitUrl}
            alt={`${race.label} male portrait`}
            width={120}
            height={188}
            className="object-cover border border-border"
          />
          <span className="text-xs text-text-muted tracking-wider uppercase">
            Male
          </span>
        </div>
      )}
    </div>
  )
}

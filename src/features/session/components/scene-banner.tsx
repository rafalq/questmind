// src/features/session/components/scene-banner.tsx
import { type Genre } from '@/worlds/schema/primitives'
import { sceneImage } from '@/worlds/schema/scenes'
import Image from 'next/image'

/**
 * The scene background is derived, never stored: it comes straight from the
 * snapshot the server just validated. Keying the <img> on the resolved src
 * remounts it on every scene change, which is what triggers the fade — no
 * second image, no opacity juggling, no local state to fall out of sync.
 */
export function SceneBanner({
  genre,
  sceneTag,
}: {
  genre: Genre
  sceneTag: string | null
}) {
  const src = sceneImage(genre, sceneTag)

  return (
    <div className="relative h-28 w-full overflow-hidden rounded-lg md:h-40">
      <Image
        key={src}
        src={src}
        alt=""
        aria-hidden
        fill
        sizes="288px"
        priority={false}
        className="object-cover"
        style={{ animation: 'scene-fade 500ms ease-out' }}
      />

      {/* Bottom fade so the panel below reads as part of the same surface */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-background to-transparent" />
      <style>{`
        @keyframes scene-fade { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </div>
  )
}

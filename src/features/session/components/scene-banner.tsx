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
        // The panel is a drawer below lg (up to 20rem) and a fixed 18rem
        // column above it, so the intrinsic width differs by breakpoint.
        sizes="(max-width: 1024px) 20rem, 18rem"
        priority={false}
        className="animate-scene-fade object-cover"
      />

      {/* Bottom fade so the panel below reads as part of the same surface.
          Must match the panel's own background token — a hardcoded or
          non-existent colour here breaks the seam in one of the themes. */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-bg-surface to-transparent" />
    </div>
  )
}

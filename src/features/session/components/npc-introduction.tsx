// src/features/session/components/npc-introductions.tsx
import Image from 'next/image'
import type { NpcPortrait } from '@/features/lore/queries/get-npc-portraits'

/**
 * Portraits of the people this turn introduced, rendered beside the mechanical
 * delta and derived the same way: from the snapshot attached to the message,
 * never from the prose.
 *
 * Tied to the message rather than to the stats panel because `npcMet` is an
 * event, not a state — it is populated only on the turn of the first meeting.
 * A panel needs something that is true every turn (as `sceneTag` is); a message
 * wants exactly this: what happened here. It also means a resumed campaign
 * shows the same faces in the same places, with nothing extra persisted.
 *
 * Names the model invents are dropped upstream by the portrait lookup. That is
 * deliberate: the prompt allows invented NPCs and warns the model they will not
 * be remembered, so a missing portrait is that rule working, not a failure.
 */
export default function NpcIntroductions({
  npcs,
}: {
  npcs: (NpcPortrait & { isIntroduction?: boolean })[]
}) {
  if (npcs.length === 0) return null

  return (
    <div className="mt-3 flex flex-col gap-4 border-t border-border/40 pt-3">
      {npcs.map((npc) =>
        npc.isIntroduction ? (
          // Meeting someone for the first time is an event in the story, so it
          // gets the space an event deserves.
          <figure key={npc.name} className="flex flex-col gap-2">
            <Image
              src={npc.portraitUrl}
              alt=""
              aria-hidden
              width={280}
              height={373}
              sizes="(max-width: 640px) 60vw, 280px"
              className="w-2/3 max-w-70 aspect-3/4 rounded-md object-cover sm:w-1/2"
            />
            <figcaption className="font-sans text-sm leading-tight">
              <span className="block text-text-primary">{npc.name}</span>
              {npc.title && (
                <span className="block text-xs text-text-muted">
                  {npc.title}
                </span>
              )}
            </figcaption>
          </figure>
        ) : (
          <figure key={npc.name} className="flex items-center gap-2">
            {/* ...istniejąca wersja 40px... */}
          </figure>
        )
      )}
    </div>
  )
}

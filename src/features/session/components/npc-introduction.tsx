// src/features/session/components/npc-introduction.tsx
import Image from 'next/image'
import type { NpcPortrait } from '@/features/lore/queries/get-npc-portraits'

/**
 * Portraits of the people this turn introduced, rendered beside the mechanical
 * delta and derived the same way: from the snapshot attached to the message,
 * never from the prose.
 *
 * Tied to the message rather than to the stats panel because `npcMet` is an
 * event, not a state — it is populated only on the turn of the first meeting.
 * A panel needs something true every turn (as `sceneTag` is); a message wants
 * exactly this: what happened here. It also means a resumed campaign shows the
 * same faces in the same places, with nothing extra persisted.
 *
 * A first meeting renders the full portrait; a name the model repeats in a
 * later turn renders as a compact avatar. `isIntroduction` is optional so the
 * component is safe when the caller does not compute it — the portrait is the
 * sensible default, not the empty branch that silently rendered nothing before.
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
        npc.isIntroduction === false ? (
          // Seen earlier this session: a small avatar and a name, no fanfare.
          <figure key={npc.name} className="flex items-center gap-2">
            <Image
              src={npc.portraitUrl}
              alt=""
              aria-hidden
              width={40}
              height={40}
              className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-border/60"
            />
            <figcaption className="min-w-0 font-sans text-xs leading-tight">
              <span className="block truncate text-text-primary">
                {npc.name}
              </span>
              {npc.title && (
                <span className="block truncate text-text-muted">
                  {npc.title}
                </span>
              )}
            </figcaption>
          </figure>
        ) : (
          // First meeting (or the caller did not distinguish): full portrait.
          <figure key={npc.name} className="flex flex-col gap-2">
            <Image
              src={npc.portraitUrl}
              alt=""
              aria-hidden
              width={280}
              height={373}
              sizes="(max-width: 640px) 60vw, 280px"
              className="aspect-3/4 w-2/3 max-w-70 rounded-md object-cover object-top sm:w-1/2"
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
        )
      )}
    </div>
  )
}

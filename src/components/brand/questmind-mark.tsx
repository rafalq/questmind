import type { SVGProps } from 'react'

/**
 * QuestMind logo mark — d20 with a neural core.
 * Colour is inherited via `currentColor`, so set it with a text-* class.
 *
 * <QuestMindMark className="h-8 w-8 text-amber-400" />
 */
export function QuestMindMark({
  title = 'QuestMind',
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeLinecap="round"
      role="img"
      aria-label={title}
      {...props}
    >
      {/* outer icosahedron silhouette */}
      <polygon
        points="50,4 89.84,27 89.84,73 50,96 10.16,73 10.16,27"
        strokeWidth={6}
      />

      {/* inverted face + spokes */}
      <g strokeWidth={4} opacity={0.85}>
        <polygon points="10.16,27 89.84,27 50,96" />
        <line x1="50" y1="27" x2="50" y2="4" />
        <line x1="30.08" y1="61.5" x2="10.16" y2="73" />
        <line x1="69.92" y1="61.5" x2="89.84" y2="73" />
      </g>

      {/* neural core links */}
      <path
        strokeWidth={4}
        d="M50 27 L30.08 61.5 M50 27 L69.92 61.5 M30.08 61.5 L69.92 61.5
           M50 27 L50 50 M30.08 61.5 L50 50 M69.92 61.5 L50 50"
      />

      {/* neural core nodes */}
      <g fill="currentColor" stroke="none">
        <circle cx="50" cy="27" r="5" />
        <circle cx="30.08" cy="61.5" r="5" />
        <circle cx="69.92" cy="61.5" r="5" />
        <circle cx="50" cy="50" r="4" />
      </g>
    </svg>
  )
}

/**
 * Simplified mark for small sizes (< 24px) — favicons, avatars, dense UI.
 * The neural core collapses into a single node so it stays legible.
 */
export function QuestMindMarkSmall({
  title = 'QuestMind',
  ...props
}: SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeLinecap="round"
      role="img"
      aria-label={title}
      {...props}
    >
      <g strokeWidth={8}>
        <polygon points="50,4 89.84,27 89.84,73 50,96 10.16,73 10.16,27" />
        <polygon points="10.16,27 89.84,27 50,96" />
      </g>
      <circle cx="50" cy="50" r="8" fill="currentColor" stroke="none" />
    </svg>
  )
}

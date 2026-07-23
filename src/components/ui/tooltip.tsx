type TooltipProps = {
  content: string
  children: React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const positionClasses = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
}

export default function Tooltip({
  content,
  children,
  position = 'top',
}: TooltipProps) {
  return (
    <div className="group/tooltip relative inline-flex">
      {children}
      {/* on-surface: this is used inside .on-media cards (the active-campaign
          badge on a character card), where it would otherwise inherit the
          light-on-artwork palette and draw pale text on its own bg-bg-elevated
          panel. The bubble is its own surface, not part of the artwork.

          role="tooltip" without aria-describedby on the trigger is only half
          the wiring, but it is the half that can be done without a ref here;
          the text is also visible on hover, so it is not the sole channel. */}
      <span
        role="tooltip"
        className={`on-surface absolute ${positionClasses[position]} pointer-events-none z-50 whitespace-nowrap border border-border bg-bg-elevated px-2 py-1 text-xs text-text-primary opacity-0 shadow-lg transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100`}
      >
        {content}
      </span>
    </div>
  )
}

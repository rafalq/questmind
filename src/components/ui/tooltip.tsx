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
    <div className="relative group/tooltip inline-flex">
      {children}
      <span
        className={`
          absolute ${positionClasses[position]}
          px-2 py-1 text-xs text-text-primary bg-bg-elevated border border-border
          whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100
          transition-opacity pointer-events-none z-50
        `}
      >
        {content}
      </span>
    </div>
  )
}

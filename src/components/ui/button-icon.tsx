import { type ButtonHTMLAttributes } from 'react'
import Tooltip from './tooltip'

type ButtonIconProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: React.ReactNode
  tooltip: string
  variant?: 'default' | 'danger'
}

const variantClasses: Record<'default' | 'danger', string> = {
  default: 'text-text-muted hover:text-text-primary',
  danger: 'text-text-muted hover:text-red-500',
}

export default function ButtonIcon({
  icon,
  tooltip,
  variant = 'default',
  className = '',
  ...props
}: ButtonIconProps) {
  return (
    <Tooltip content={tooltip}>
      <button
        className={`transition-colors ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {icon}
      </button>
    </Tooltip>
  )
}

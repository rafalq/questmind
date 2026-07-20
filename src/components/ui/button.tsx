import { type ButtonHTMLAttributes } from 'react'

type Variant = 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  loadingText?: string
}

const variantClasses: Record<Variant, string> = {
  outline:
    'border border-accent text-accent hover:bg-accent hover:text-accent-fg disabled:opacity-60',
  ghost:
    'border border-accent text-text-primary hover:border-accent-hover hover:text-accent disabled:opacity-60',
  danger:
    'border border-red-700 text-red-500 hover:bg-red-700 hover:text-white disabled:opacity-60',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 sm:px-5 text-sm',
  lg: 'px-5 py-2.5 sm:px-6 sm:py-3 text-sm',
}

export default function Button({
  variant = 'outline',
  size = 'md',
  loading = false,
  loadingText,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`
        tracking-wider transition-all disabled:cursor-not-allowed cursor-pointer
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      {...props}
    >
      {loading && loadingText ? loadingText : children}
    </button>
  )
}

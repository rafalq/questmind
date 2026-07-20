import Link from 'next/link'

type Variant = 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type ButtonLinkProps = {
  href: string
  children: React.ReactNode
  variant?: Variant
  size?: Size
  className?: string
}

const variantClasses: Record<Variant, string> = {
  outline:
    'border border-accent text-accent hover:bg-accent hover:text-accent-fg',
  ghost:
    'border border-border text-text-secondary hover:border-text-muted hover:text-text-primary',
  danger:
    'border border-red-700 text-red-500 hover:bg-red-700 hover:text-white',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 sm:px-5 text-sm',
  lg: 'px-5 py-2.5 sm:px-6 sm:py-3 text-sm',
}

export default function ButtonLink({
  href,
  children,
  variant = 'outline',
  size = 'md',
  className = '',
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`
        inline-flex items-center justify-center gap-2
        tracking-wider transition-all
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
    >
      {children}
    </Link>
  )
}

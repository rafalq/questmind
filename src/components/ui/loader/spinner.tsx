type SpinnerSize = 'sm' | 'md' | 'lg' | 'xl'
type SpinnerColor = 'light' | 'dark' | 'gold'

type SpinnerProps = {
  size?: SpinnerSize
  color?: SpinnerColor
}

const sizeMap: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-8 h-8 border-4',
  lg: 'w-12 h-12 border-6',
  xl: 'w-24 h-24 border-8',
}

const colorMap: Record<SpinnerColor, string> = {
  light: 'border-white/20 border-t-white',
  dark: 'border-black/20 border-t-black',
  gold: 'border-yellow-600/20 border-t-yellow-600',
}

export default function Spinner({ size = 'md', color = 'dark' }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center">
      <div
        className={`rounded-full animate-spin ${sizeMap[size]} ${colorMap[color]}`}
      />
    </div>
  )
}

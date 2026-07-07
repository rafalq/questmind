import { IconPlayerPlay } from '@tabler/icons-react'
import Button from './button'
import { ButtonHTMLAttributes } from 'react'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  onClick: () => void
  isActiveSession: boolean
  className?: string
}

export default function ButtonPlayResume({
  onClick,
  isActiveSession,
  className,
}: Props) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className={
        className || 'flex items-center justify-center gap-2 cursor-pointer'
      }
    >
      <IconPlayerPlay stroke={2} size={14} />
      {isActiveSession ? 'Resume' : 'Play'}
    </Button>
  )
}

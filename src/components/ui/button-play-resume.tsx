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
  // Everything else — onMouseEnter and onFocus are what the caller uses to
  // start prefetching the session route before the click lands. They were
  // being dropped: the props type has always allowed them, but the component
  // only ever forwarded onClick.
  ...rest
}: Props) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className={
        className || 'flex items-center justify-center gap-2 cursor-pointer'
      }
      {...rest}
    >
      <IconPlayerPlay stroke={2} size={14} />
      {isActiveSession ? 'Resume' : 'Play'}
    </Button>
  )
}

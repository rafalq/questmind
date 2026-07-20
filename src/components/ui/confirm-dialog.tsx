'use client'

import Button from './button'

type ConfirmDialogProps = {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
  isPending?: boolean
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  isPending = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-md mx-4 p-5 sm:p-8 bg-bg-base border border-border">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-2">
          {title}
        </h2>
        <p className="text-text-secondary text-sm mb-6 sm:mb-8">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 sm:justify-end">
          <Button
            onClick={onCancel}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isPending}
            className="w-full sm:w-auto border-red-800 text-red-500 hover:bg-red-900/30 hover:text-red-500"
          >
            {isPending ? 'Deleting...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}

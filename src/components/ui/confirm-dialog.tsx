'use client'

import Modal from './modal'
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

/**
 * Confirmation for a destructive action.
 *
 * It was the only dialog in the app with no role, no aria-modal, no Escape and
 * no focus handling - so a keyboard user could reach Delete but not Cancel,
 * and a screen reader announced nothing about being in a dialog at all. On the
 * one dialog where the wrong answer is unrecoverable. All of that now comes
 * from Modal.
 */
export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
  isPending = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={isOpen} onClose={onCancel} size="sm">
      {(titleId) => (
        <div className="p-5 sm:p-8">
          <h2
            id={titleId}
            className="mb-2 text-lg font-bold text-text-primary sm:text-xl"
          >
            {title}
          </h2>
          <p className="mb-6 text-sm text-text-secondary sm:mb-8">{message}</p>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end sm:gap-4">
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
              className="w-full border-red-800 text-red-500 hover:bg-red-900/30 hover:text-red-500 sm:w-auto"
            >
              {isPending ? 'Deleting...' : confirmLabel}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

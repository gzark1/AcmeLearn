import { Modal, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

import { useDeactivateUser } from '../api'

type DeactivateUserModalProps = {
  userId: string
  userEmail: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export const DeactivateUserModal = ({
  userId,
  userEmail,
  isOpen,
  onClose,
  onSuccess,
}: DeactivateUserModalProps) => {
  const { mutate: deactivate, isPending } = useDeactivateUser()

  const handleDeactivate = () => {
    deactivate(
      { userId },
      {
        onSuccess: () => {
          onClose()
          onSuccess?.()
        },
      }
    )
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Deactivate User"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-slate-600">
          Are you sure you want to deactivate{' '}
          <span className="font-semibold text-slate-900">{userEmail}</span>?
        </p>

        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-sm text-amber-800">
            This will prevent the user from logging in. You can reactivate them
            later if needed.
          </p>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose} disabled={isPending}>
          Cancel
        </Button>
        <Button
          variant="destructive"
          onClick={handleDeactivate}
          disabled={isPending}
        >
          {isPending ? 'Deactivating...' : 'Deactivate User'}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

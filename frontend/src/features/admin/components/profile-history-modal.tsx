import { Modal, ModalFooter } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { useUserProfileHistory } from '../api'
import type { ProfileSnapshot } from '../types'

type ProfileHistoryModalProps = {
  userId: string
  isOpen: boolean
  onClose: () => void
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const SnapshotItem = ({ snapshot }: { snapshot: ProfileSnapshot }) => {
  return (
    <div className="relative border-l-2 border-violet-200 pb-6 pl-6 last:pb-0">
      {/* Timeline dot */}
      <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 border-violet-500 bg-white" />

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900">
            Version {snapshot.version}
          </span>
          <span className="text-sm text-slate-500">
            {formatDate(snapshot.created_at)}
          </span>
        </div>

        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <div className="grid gap-2">
            <div>
              <span className="font-medium text-slate-600">Learning Goal: </span>
              <span className="text-slate-900">
                {snapshot.learning_goal || 'Not set'}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-600">Level: </span>
              <span className="text-slate-900">
                {snapshot.current_level || 'Not set'}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-600">Time: </span>
              <span className="text-slate-900">
                {snapshot.time_commitment
                  ? `${snapshot.time_commitment} hrs/week`
                  : 'Not set'}
              </span>
            </div>
            {snapshot.interests_snapshot.length > 0 && (
              <div>
                <span className="font-medium text-slate-600">Interests: </span>
                <span className="text-slate-900">
                  {snapshot.interests_snapshot.join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const ProfileHistoryModal = ({
  userId,
  isOpen,
  onClose,
}: ProfileHistoryModalProps) => {
  const { data, isLoading } = useUserProfileHistory(userId)

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Profile History"
      description="Timeline of profile changes"
      size="lg"
    >
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : data?.snapshots.length === 0 ? (
          <p className="py-8 text-center text-slate-500">
            No profile history available.
          </p>
        ) : (
          <div className="py-2">
            {data?.snapshots.map((snapshot) => (
              <SnapshotItem key={snapshot.id} snapshot={snapshot} />
            ))}
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  )
}

import { useNotifications } from '@/stores/notifications'
import { Toast } from './toast'

export const Toaster = () => {
  const { notifications, dismissNotification } = useNotifications()

  if (notifications.length === 0) {
    return null
  }

  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end gap-2 px-4 py-6 sm:p-6"
    >
      <div className="flex w-full flex-col items-end gap-2">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            notification={notification}
            onDismiss={dismissNotification}
          />
        ))}
      </div>
    </div>
  )
}

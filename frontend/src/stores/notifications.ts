import { create } from 'zustand'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export type Notification = {
  id: string
  type: NotificationType
  title: string
  message?: string
}

type NotificationsState = {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  dismissNotification: (id: string) => void
}

export const useNotifications = create<NotificationsState>((set) => ({
  notifications: [],

  addNotification: (notification) => {
    const id = crypto.randomUUID()

    set((state) => ({
      notifications: [...state.notifications, { id, ...notification }],
    }))

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }))
    }, 5000)
  },

  dismissNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }))
  },
}))

import { create } from 'zustand'

export interface Notification {
  id: string
  type: 'order_ready' | 'order_cancelled' | 'new_order'
  title: string
  message: string
  tableNumber: number
  createdAt: string
  read: boolean
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  unreadCount: () => number
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...state.notifications,
      ],
    })),

  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
    })),

  unreadCount: () => get().notifications.filter(n => !n.read).length,
}))
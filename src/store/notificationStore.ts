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
  notifications: [
    {
      id: '1',
      type: 'order_ready',
      title: 'Pedido pronto!',
      message: 'Mesa 03 — X-Burguer e Coca-Cola prontos para servir',
      tableNumber: 3,
      createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
      read: false,
    },
    {
      id: '2',
      type: 'order_ready',
      title: 'Pedido pronto!',
      message: 'Mesa 07 — Batata frita e Suco de laranja prontos para servir',
      tableNumber: 7,
      createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
      read: false,
    },
    {
      id: '3',
      type: 'new_order',
      title: 'Novo pedido',
      message: 'Mesa 05 — Pedido criado pelo totem',
      tableNumber: 5,
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
      read: true,
    },
    {
      id: '4',
      type: 'order_cancelled',
      title: 'Pedido cancelado',
      message: 'Mesa 02 — Pedido #AB4B52 foi cancelado',
      tableNumber: 2,
      createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
      read: true,
    },
  ],

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
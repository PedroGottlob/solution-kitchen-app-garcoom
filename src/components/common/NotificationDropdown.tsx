import { useRef, useEffect } from 'react'
import { useNotificationStore } from '../../store/notificationStore'
import type { Notification } from '../../store/notificationStore'

interface NotificationDropdownProps {
  onClose: () => void
}

function getElapsedMinutes(createdAt: string): string {
  const minutes = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
  if (minutes < 1) return 'agora'
  if (minutes === 1) return '1 min atrás'
  if (minutes < 60) return `${minutes} min atrás`
  const hours = Math.floor(minutes / 60)
  return `${hours}h atrás`
}

const typeConfig: Record<Notification['type'], { icon: string; color: string; bg: string }> = {
  order_ready: { icon: 'ti-bell-ringing', color: 'text-amber-400', bg: 'bg-amber-950' },
  new_order: { icon: 'ti-clipboard-plus', color: 'text-accent-400', bg: 'bg-accent-950' },
  order_cancelled: { icon: 'ti-clipboard-x', color: 'text-red-400', bg: 'bg-red-950' },
}

export function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore()
  const ref = useRef<HTMLDivElement>(null)
  const unread = unreadCount()

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={ref}
      className="absolute right-0 top-12 w-80 bg-accent-50 border border-accent-200 rounded-xl shadow-2xl z-50 overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-accent-200">
        <span className="text-zinc-900 text-sm font-medium">
          Notificações {unread > 0 && <span className="text-accent-600">({unread})</span>}
        </span>
        {unread > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-accent-600 text-xs cursor-pointer hover:text-accent-700"
          >
            Marcar todas
          </button>
        )}
      </div>

      {/* Lista */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8">
            <i className="ti ti-bell-off text-zinc-500 text-3xl" />
            <p className="text-zinc-500 text-sm">Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map(notification => {
            const config = typeConfig[notification.type]
            return (
              <button
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`w-full flex items-start gap-3 px-4 py-3 border-b border-accent-200 cursor-pointer hover:bg-zinc-200 transition-colors text-left ${
                  !notification.read ? 'bg-zinc-200/50' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <i className={`ti ${config.icon} ${config.color} text-sm`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={`text-xs font-medium ${notification.read ? 'text-zinc-600' : 'text-zinc-900'}`}>
                      {notification.title}
                    </p>
                    <span className="text-zinc-500 text-xs whitespace-nowrap">
                      {getElapsedMinutes(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-xs">{notification.message}</p>
                </div>
                {!notification.read && (
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-400 flex-shrink-0 mt-2" />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}

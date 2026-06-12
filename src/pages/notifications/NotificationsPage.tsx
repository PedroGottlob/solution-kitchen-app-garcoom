import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '../../store/notificationStore'
import type { Notification } from '../../store/notificationStore'

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
  new_order: { icon: 'ti-clipboard-plus', color: 'text-violet-400', bg: 'bg-violet-950' },
  order_cancelled: { icon: 'ti-clipboard-x', color: 'text-red-400', bg: 'bg-red-950' },
}

export function NotificationsPage() {
  const navigate = useNavigate()
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotificationStore()

  const unread = unreadCount()

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-20">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer"
            >
              <i className="ti ti-arrow-left text-zinc-400" />
            </button>
            <div>
              <h1 className="text-white text-xl font-medium">Notificações</h1>
              {unread > 0 && (
                <p className="text-zinc-500 text-sm">{unread} não lida{unread !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          {unread > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-violet-400 text-sm cursor-pointer hover:text-violet-300"
            >
              Marcar todas
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="flex flex-col">
        {notifications.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-3 py-20">
            <i className="ti ti-bell-off text-zinc-600 text-4xl" />
            <p className="text-zinc-500">Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map(notification => {
            const config = typeConfig[notification.type]
            return (
              <button
                key={notification.id}
                onClick={() => markAsRead(notification.id)}
                className={`flex items-start gap-4 px-5 py-4 border-b border-zinc-800 cursor-pointer hover:bg-zinc-900 transition-colors text-left ${
                  !notification.read ? 'bg-zinc-900' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  <i className={`ti ${config.icon} ${config.color} text-lg`} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className={`text-sm font-medium ${notification.read ? 'text-zinc-400' : 'text-white'}`}>
                      {notification.title}
                    </p>
                    <span className="text-zinc-500 text-xs whitespace-nowrap">
                      {getElapsedMinutes(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-zinc-500 text-sm">{notification.message}</p>
                </div>

                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-violet-400 flex-shrink-0 mt-2" />
                )}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
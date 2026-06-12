import type { Order } from '../../types'

interface OrderCardProps {
  order: Order
  onCancel?: (orderId: string) => void
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  Pending: { label: 'Pendente', bg: 'bg-amber-950', text: 'text-amber-400' },
  Preparing: { label: 'Em preparo', bg: 'bg-violet-950', text: 'text-violet-400' },
  Ready: { label: 'Pronto para servir', bg: 'bg-emerald-950', text: 'text-emerald-400' },
  Delivered: { label: 'Entregue', bg: 'bg-zinc-800', text: 'text-zinc-400' },
  Cancelled: { label: 'Cancelado', bg: 'bg-red-950', text: 'text-red-400' },
}

function getElapsedMinutes(createdAt: string): number {
  const date = new Date(createdAt)
  if (isNaN(date.getTime())) return 0
  return Math.floor((Date.now() - date.getTime()) / 60000)
}

export function OrderCard({ order, onCancel }: OrderCardProps) {
  const config = statusConfig[order.status] ?? statusConfig.Pending
  const elapsed = getElapsedMinutes(order.createdAt)

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div>
          <span className="text-white font-medium text-sm">
            #{order.id.slice(-6).toUpperCase()}
          </span>
          <span className="ml-2 text-xs text-zinc-500">{elapsed} min atrás</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2">
        {order.items.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="text-violet-400 text-sm font-medium">{item.quantity}×</span>
            <div>
              <div className="text-zinc-100 text-sm">{item.name}</div>
              {item.notes && (
                <div className="text-zinc-500 text-xs">{item.notes}</div>
              )}
            </div>
            <span className="ml-auto text-zinc-400 text-sm">
              R$ {(item.unitPrice * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
        <span className="text-white font-medium text-sm">
          Total: R$ {order.totalAmount.toFixed(2)}
        </span>
        {order.status === 'Pending' && onCancel && (
          <button
            onClick={() => onCancel(order.id)}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-950 text-red-400 border border-red-900 hover:bg-red-900 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  )
}
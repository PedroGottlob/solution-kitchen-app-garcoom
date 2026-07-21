import type { Order } from '../../types'
import { useTableStore } from '../../store/tableStore'

interface OrderCardProps {
  order: Order
  onCancel?: (orderId: string) => void
  onDeliver?: (orderId: string) => void
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  Pending: { label: 'Pendente', bg: 'bg-amber-950', text: 'text-amber-400' },
  Preparing: { label: 'Em preparo', bg: 'bg-violet-950', text: 'text-violet-400' },
  Ready: { label: 'Pronto para servir', bg: 'bg-emerald-950', text: 'text-emerald-400' },
  Delivered: { label: 'Entregue', bg: 'bg-zinc-800', text: 'text-zinc-400' },
  Cancelled: { label: 'Cancelado', bg: 'bg-red-950', text: 'text-red-400' },
  Closed: { label: 'Fechado', bg: 'bg-zinc-800', text: 'text-zinc-500' },
}

function getElapsedMinutes(createdAt: string): number {
  const date = new Date(createdAt)
  if (isNaN(date.getTime())) return 0
  return Math.floor((Date.now() - date.getTime()) / 60000)
}

interface NormalizedOption {
  name: string
  additionalCost: number
}

// SignalR entrega PascalCase (SelectedOptions/Name/AdditionalCost),
// REST entrega camelCase (selectedOptions/name/additionalCost).
// Normaliza os dois formatos.
function getOptions(item: any): NormalizedOption[] {
  const raw = item.selectedOptions ?? item.SelectedOptions ?? []
  return raw.map((o: any) => ({
    name: o.name ?? o.Name ?? '',
    additionalCost: o.additionalCost ?? o.AdditionalCost ?? 0,
  }))
}

export function OrderCard({ order, onCancel, onDeliver }: OrderCardProps) {
  const config = statusConfig[order.status] ?? statusConfig.Pending
  const elapsed = getElapsedMinutes(order.createdAt)
  const table = useTableStore(s => s.tables.find(t => t.id === order.tableId))
  const tableLabel = table ? `Mesa ${String(table.number).padStart(2, '0')}` : 'Mesa'

  return (
    <div className={`bg-zinc-900 rounded-xl border overflow-hidden ${
      order.status === 'Ready' ? 'border-emerald-900' : 'border-zinc-800'
    }`}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium text-sm">{tableLabel}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-xs text-zinc-500">
            #{((order.id ?? (order as any).Id) || '??????').toString().slice(-6).toUpperCase()}
          </span>
          <span className="text-zinc-600">·</span>
          <span className="text-xs text-zinc-500">{elapsed} min</span>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${config.bg} ${config.text}`}>
          {config.label}
        </span>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2">
        {order.items.map((item, i) => {
          const options = getOptions(item)
          return (
            <div key={i} className="flex items-start gap-2">
              <span className="text-violet-400 text-sm font-medium">{item.quantity}×</span>
              <div className="flex-1">
                <div className="text-zinc-100 text-sm">{item.name}</div>
                {item.notes && (
                  <div className="text-zinc-500 text-xs">{item.notes}</div>
                )}
                {options.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {options.map((opt, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700"
                      >
                        {opt.name}
                        {opt.additionalCost > 0 && (
                          <span className="text-violet-400 ml-1">+R${opt.additionalCost.toFixed(0)}</span>
                        )}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <span className="ml-auto text-zinc-400 text-sm">
                R$ {(item.unitPrice * item.quantity).toFixed(2)}
              </span>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
        <span className="text-white font-medium text-sm">
          Total: R$ {order.totalAmount.toFixed(2)}
        </span>
        <div className="flex gap-2">
          {order.status === 'Pending' && onCancel && (
            <button
              onClick={() => onCancel(order.id)}
              className="text-xs px-3 py-1.5 rounded-lg bg-red-950 text-red-400 border border-red-900 hover:bg-red-900 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          )}
          {order.status === 'Ready' && onDeliver && (
            <button
              onClick={() => onDeliver(order.id)}
              className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-900 hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              Confirmar entrega
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
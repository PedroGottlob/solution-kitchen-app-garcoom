import { useState } from 'react'
import { OrderCard } from '../../components/waiter/OrderCard'
import { useOrders } from '../../hooks/useOrders'
import { orderService } from '../../services/orderService'

type FilterStatus = 'all' | 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled'

const filters: { label: string; value: FilterStatus }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendentes', value: 'Pending' },
  { label: 'Em preparo', value: 'Preparing' },
  { label: 'Prontos', value: 'Ready' },
  { label: 'Entregues', value: 'Delivered' },
  { label: 'Cancelados', value: 'Cancelled' },
]

export function OrdersPage() {
  const { orders, connected } = useOrders()
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all')

  const filtered = orders.filter(o =>
    activeFilter === 'all' ? true : o.status === activeFilter
  )

  const pending = orders.filter(o => o.status === 'Pending').length
  const preparing = orders.filter(o => o.status === 'Preparing').length
  const ready = orders.filter(o => o.status === 'Ready').length

  async function handleDeliver(orderId: string) {
    try {
      await orderService.updateStatus(orderId, 'Delivered')
    } catch (e) {
      console.error(e)
    }
  }

  async function handleCancel(orderId: string) {
    try {
      await orderService.updateStatus(orderId, 'Cancelled')
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-20">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white text-xl font-medium">Pedidos</h1>
          <span className="text-zinc-500 text-sm">
            {!connected ? 'Conectando...' : `${orders.length} pedido${orders.length !== 1 ? 's' : ''} ativo${orders.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border cursor-pointer transition-colors ${
                activeFilter === f.value
                  ? 'bg-violet-950 text-violet-400 border-violet-900'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de contagem (clicáveis) */}
      <div className="px-5 py-4 flex gap-3">
        <button
          onClick={() => setActiveFilter('Pending')}
          className={`flex-1 bg-zinc-900 rounded-xl p-3 text-center border cursor-pointer transition-colors ${
            activeFilter === 'Pending' ? 'border-amber-900' : 'border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="text-amber-400 text-lg font-medium">{pending}</div>
          <div className="text-zinc-500 text-xs">Pendentes</div>
        </button>
        <button
          onClick={() => setActiveFilter('Preparing')}
          className={`flex-1 bg-zinc-900 rounded-xl p-3 text-center border cursor-pointer transition-colors ${
            activeFilter === 'Preparing' ? 'border-violet-900' : 'border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="text-violet-400 text-lg font-medium">{preparing}</div>
          <div className="text-zinc-500 text-xs">Em preparo</div>
        </button>
        <button
          onClick={() => setActiveFilter('Ready')}
          className={`flex-1 bg-zinc-900 rounded-xl p-3 text-center border cursor-pointer transition-colors ${
            activeFilter === 'Ready' ? 'border-emerald-900' : 'border-zinc-800 hover:border-zinc-700'
          }`}
        >
          <div className="text-emerald-400 text-lg font-medium">{ready}</div>
          <div className="text-zinc-500 text-xs">Prontos</div>
        </button>
      </div>

      <div className="px-5 flex flex-col gap-3">
        {!connected ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-500">Conectando...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center py-12 flex-col gap-3">
            <i className="ti ti-clipboard-list text-zinc-600 text-4xl" />
            <p className="text-zinc-500">Nenhum pedido encontrado</p>
          </div>
        ) : (
          filtered.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onDeliver={order.status === 'Ready' ? handleDeliver : undefined}
              onCancel={order.status === 'Pending' ? handleCancel : undefined}
            />
          ))
        )}
      </div>
    </div>
  )
}
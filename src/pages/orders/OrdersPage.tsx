import { useState } from 'react'
import { OrderCard } from '../../components/waiter/OrderCard'
import { useOrders } from '../../hooks/useOrders'

type FilterStatus = 'all' | 'Pending' | 'Preparing' | 'Ready'

const filters: { label: string; value: FilterStatus }[] = [
  { label: 'Todos', value: 'all' },
  { label: 'Pendentes', value: 'Pending' },
  { label: 'Em preparo', value: 'Preparing' },
  { label: 'Prontos', value: 'Ready' },
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

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-20">
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-white text-xl font-medium">Pedidos</h1>
          <span className="text-zinc-500 text-sm">
            {!connected ? 'Conectando...' : `Hoje · ${orders.length} pedidos`}
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

      <div className="px-5 py-4 flex gap-3">
        <div className="flex-1 bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
          <div className="text-amber-400 text-lg font-medium">{pending}</div>
          <div className="text-zinc-500 text-xs">Pendentes</div>
        </div>
        <div className="flex-1 bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
          <div className="text-violet-400 text-lg font-medium">{preparing}</div>
          <div className="text-zinc-500 text-xs">Em preparo</div>
        </div>
        <div className="flex-1 bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
          <div className="text-emerald-400 text-lg font-medium">{ready}</div>
          <div className="text-zinc-500 text-xs">Prontos</div>
        </div>
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
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  )
}
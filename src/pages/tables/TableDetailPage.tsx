import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTableStore } from '../../store/tableStore'
import { OrderCard } from '../../components/waiter/OrderCard'
import { orderService } from '../../services/orderService'
import type { Order } from '../../types'

export function TableDetailPage() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const { tables } = useTableStore()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const table = tables.find(t => t.id === tableId)
  const total = orders.reduce((acc, o) => acc + o.totalAmount, 0)
  const hasReady = orders.some(o => o.status === 'Ready')

  useEffect(() => {
    if (!tableId) return
    setLoading(true)
    orderService.getOrdersByTable(tableId)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [tableId])

  if (!table) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-500">Mesa não encontrada</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-20">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer"
          >
            <i className="ti ti-arrow-left text-zinc-400" />
          </button>
          <div>
            <h1 className="text-white text-xl font-medium">
              Mesa {String(table.number).padStart(2, '0')}
            </h1>
            <p className="text-zinc-500 text-sm">
              {loading ? 'Carregando...' : `${orders.length} pedido${orders.length !== 1 ? 's' : ''} · Total: R$ ${total.toFixed(2)}`}
            </p>
          </div>
        </div>

        {hasReady && (
          <div className="mt-3 bg-amber-950 border border-amber-900 rounded-xl px-4 py-2 flex items-center gap-2">
            <i className="ti ti-bell text-amber-400 text-sm" />
            <span className="text-amber-400 text-sm">Pedido pronto para servir!</span>
          </div>
        )}
      </div>

      {/* Pedidos */}
      <div className="px-5 py-4 flex flex-col gap-3">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
          Pedidos ativos
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-500">Carregando pedidos...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex items-center justify-center py-12 flex-col gap-3">
            <i className="ti ti-clipboard-list text-zinc-600 text-4xl" />
            <p className="text-zinc-500">Nenhum pedido nesta mesa</p>
          </div>
        ) : (
          orders.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>

      {/* Actions */}
      <div className="fixed bottom-20 left-0 right-0 px-5 flex flex-col gap-3">
        <button
          onClick={() => navigate(`/tables/${tableId}/new-order`)}
          className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-violet-500 transition-colors"
        >
          <i className="ti ti-plus text-lg" />
          Novo pedido
        </button>

        {orders.length > 0 && (
          <button
            onClick={() => navigate(`/tables/${tableId}/account`)}
            className="w-full py-3.5 rounded-xl bg-zinc-800 text-zinc-300 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-zinc-700 transition-colors"
          >
            <i className="ti ti-receipt text-lg" />
            Fechar conta · R$ {total.toFixed(2)}
          </button>
        )}
      </div>
    </div>
  )
}
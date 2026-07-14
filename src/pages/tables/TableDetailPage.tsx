import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTableStore } from '../../store/tableStore'
import { OrderCard } from '../../components/waiter/OrderCard'
import { useOrders } from '../../hooks/useOrders'
import { orderService } from '../../services/orderService'
import { tableService } from '../../services/tableService'

export function TableDetailPage() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const { tables } = useTableStore()

  const { orders, connected } = useOrders(tableId)

  const table = tables.find(t => t.id === tableId)
  const visibleOrders = orders.filter(o => o.status !== 'Cancelled' && o.status !== 'Closed')
  const total = visibleOrders.reduce((acc, o) => acc + o.totalAmount, 0)
  const hasReady = visibleOrders.some(o => o.status === 'Ready')

  const [confirmClose, setConfirmClose] = useState(false)
  const [closing, setClosing] = useState(false)

  async function handleDeliver(orderId: string) {
    try {
      await orderService.updateStatus(orderId, 'Delivered')
    } catch (e) {
      console.error(e)
    }
  }

  async function handleCloseTable() {
    if (!tableId) return
    setClosing(true)
    try {
      await tableService.closeTable(tableId)
      navigate('/')
    } catch (e) {
      console.error(e)
      setClosing(false)
      setConfirmClose(false)
    }
  }

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
              {!connected ? 'Conectando...' : `${visibleOrders.length} pedido${visibleOrders.length !== 1 ? 's' : ''}`}
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
          Pedidos da mesa
        </p>

        {!connected ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-500">Conectando...</p>
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="flex items-center justify-center py-12 flex-col gap-3">
            <i className="ti ti-clipboard-list text-zinc-600 text-4xl" />
            <p className="text-zinc-500">Nenhum pedido nesta mesa</p>
          </div>
        ) : (
          visibleOrders.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onDeliver={order.status === 'Ready' ? handleDeliver : undefined}
            />
          ))
        )}

        {/* Botão de fechar mesa manualmente — escape hatch */}
        <button
          onClick={() => setConfirmClose(true)}
          className="mt-4 py-2.5 rounded-xl border border-zinc-800 text-zinc-500 text-sm cursor-pointer hover:bg-zinc-900 hover:text-zinc-300 transition-colors flex items-center justify-center gap-2"
        >
          <i className="ti ti-lock" />
          Fechar mesa manualmente
        </button>
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

        {visibleOrders.length > 0 && (
          <button
            onClick={() => navigate(`/tables/${tableId}/account`)}
            className="w-full py-3.5 rounded-xl bg-zinc-800 text-zinc-300 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-zinc-700 transition-colors"
          >
            <i className="ti ti-receipt text-lg" />
            Fechar conta · R$ {total.toFixed(2)}
          </button>
        )}
      </div>

      {/* Modal de confirmação */}
      {confirmClose && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 max-w-sm w-full">
            <h2 className="text-white text-lg font-medium mb-2">Fechar mesa?</h2>
            <p className="text-zinc-400 text-sm mb-5">
              Todos os pedidos abertos serão marcados como fechados e a mesa será liberada. Use apenas se o pagamento foi feito fora do app ou o cliente foi embora.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmClose(false)}
                disabled={closing}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-medium text-sm cursor-pointer hover:bg-zinc-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCloseTable}
                disabled={closing}
                className="flex-1 py-2.5 rounded-xl bg-red-900 text-red-100 font-medium text-sm cursor-pointer hover:bg-red-800 transition-colors disabled:opacity-50"
              >
                {closing ? 'Fechando...' : 'Fechar mesa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
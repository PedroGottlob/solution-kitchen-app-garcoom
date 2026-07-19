import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTableStore } from '../../store/tableStore'
import { orderService } from '../../services/orderService'
import type { Order } from '../../types'

type OpenTableSummary = {
  tableId: string
  tableNumber: number
  total: number
  orderCount: number
  oldestOrderAt: string
}

function formatDuration(from: string, now: Date): string {
  const start = new Date(from).getTime()
  const diffMs = now.getTime() - start
  if (diffMs < 0) return 'agora'

  const totalMin = Math.floor(diffMs / 60000)
  if (totalMin < 1) return 'agora'
  if (totalMin < 60) return `${totalMin}min`

  const hours = Math.floor(totalMin / 60)
  const mins = totalMin % 60
  if (mins === 0) return `${hours}h`
  return `${hours}h${String(mins).padStart(2, '0')}`
}

export function AccountPage() {
  const navigate = useNavigate()
  const { tables } = useTableStore()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    let cancelled = false
    orderService.getAllOrders()
      .then(data => { if (!cancelled) setOrders(data) })
      .catch(console.error)
      .finally(() => { if (!cancelled) setLoading(false) })

    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  const openTables = useMemo<OpenTableSummary[]>(() => {
    const openOrders = orders.filter(
      o => o.status !== 'Cancelled' && o.status !== 'Closed'
    )

    const byTable = new Map<string, Order[]>()
    for (const o of openOrders) {
      const list = byTable.get(o.tableId) ?? []
      list.push(o)
      byTable.set(o.tableId, list)
    }

    const summaries: OpenTableSummary[] = []
    byTable.forEach((tableOrders, tableId) => {
      const table = tables.find(t => t.id === tableId)
      if (!table) return

      const total = tableOrders.reduce((acc, o) => acc + o.totalAmount, 0)
      const oldest = tableOrders
        .map(o => o.createdAt)
        .sort()[0]

      summaries.push({
        tableId,
        tableNumber: table.number,
        total,
        orderCount: tableOrders.length,
        oldestOrderAt: oldest,
      })
    })

    return summaries.sort((a, b) => b.total - a.total)
  }, [orders, tables])

  const grandTotal = openTables.reduce((acc, t) => acc + t.total, 0)
  const totalOrders = openTables.reduce((acc, t) => acc + t.orderCount, 0)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-20">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <h1 className="text-white text-xl font-medium">Conta</h1>
        <p className="text-zinc-500 text-sm">Mesas ocupadas · resumo do salão</p>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-zinc-500 text-sm">Carregando...</p>
        </div>
      ) : openTables.length === 0 ? (
        <div className="flex-1 flex items-center justify-center flex-col gap-3">
          <i className="ti ti-receipt text-zinc-600 text-5xl" />
          <p className="text-zinc-500 text-lg">Nenhuma mesa aberta</p>
          <p className="text-zinc-600 text-sm">Todas as mesas do salão estão fechadas.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-5 py-4">

          {/* Resumo geral */}
          <div className="bg-gradient-to-br from-violet-950 to-zinc-900 border border-violet-900 rounded-xl px-5 py-4">
            <p className="text-violet-400 text-xs uppercase tracking-wider mb-1">
              Total em aberto
            </p>
            <p className="text-white text-3xl font-medium mb-2">
              R$ {grandTotal.toFixed(2)}
            </p>
            <p className="text-zinc-400 text-sm">
              {openTables.length} mesa{openTables.length !== 1 ? 's' : ''} · {totalOrders} pedido{totalOrders !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Lista de mesas */}
          <div>
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">
              Mesas com conta aberta
            </p>

            <div className="flex flex-col gap-2">
              {openTables.map(t => (
                <button
                  key={t.tableId}
                  onClick={() => navigate(`/tables/${t.tableId}`)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-zinc-700 hover:bg-zinc-800 transition-colors text-left"
                >
                  <div>
                    <p className="text-white text-sm font-medium">
                      Mesa {String(t.tableNumber).padStart(2, '0')}
                    </p>
                    <p className="text-zinc-500 text-xs mt-0.5">
                      {t.orderCount} pedido{t.orderCount !== 1 ? 's' : ''} · aberta há {formatDuration(t.oldestOrderAt, now)}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <p className="text-violet-400 text-sm font-medium">
                      R$ {t.total.toFixed(2)}
                    </p>
                    <i className="ti ti-chevron-right text-zinc-600" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
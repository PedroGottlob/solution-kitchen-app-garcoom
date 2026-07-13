import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type DashboardData, getDashboard } from '../../services/dashboardService'

function MetricCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-zinc-500 text-xs">{label}</span>
      <span className="text-white text-xl font-medium">{value}</span>
      {sub && <span className="text-zinc-500 text-xs">{sub}</span>}
    </div>
  )
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatPercent(value: number) {
  if (value === 0) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(0)}% vs anterior`
}

const statusMap: Record<string, string> = {
  Pending: 'Pendente',
  Preparing: 'Preparando',
  Ready: 'Pronto',
  Delivered: 'Entregue',
  Closed: 'Fechado',
  Cancelled: 'Cancelado',
}

function translateStatus(status: string) {
  return statusMap[status] ?? status
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center pb-20">
        <span className="text-zinc-500 text-sm">Carregando dashboard...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center pb-20">
        <span className="text-zinc-500 text-sm">Erro ao carregar dados.</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pt-6 pb-28">
      <h1 className="text-white text-lg font-medium mb-6">Dashboard</h1>

      {/* Receita */}
      <section className="mb-6">
        <h2 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Receita</h2>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Hoje"
            value={formatBRL(data.revenueToday)}
            sub={formatPercent(data.revenueTodayVsYesterdayPercent)}
          />
          <MetricCard label="Ontem" value={formatBRL(data.revenueYesterday)} />
          <MetricCard
            label="Este mês"
            value={formatBRL(data.revenueThisMonth)}
            sub={formatPercent(data.revenueThisMonthVsLastMonthPercent)}
          />
          <MetricCard label="Mês passado" value={formatBRL(data.revenueLastMonth)} />
        </div>
      </section>

      {/* Pedidos */}
      <section className="mb-6">
        <h2 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Pedidos</h2>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard label="Hoje" value={String(data.ordersToday)} />
          <MetricCard label="Este mês" value={String(data.ordersThisMonth)} />
          <MetricCard label="Ticket médio hoje" value={formatBRL(data.averageTicketToday)} />
          <MetricCard label="Ticket médio mês" value={formatBRL(data.averageTicketThisMonth)} />
        </div>
      </section>

      {/* Status dos pedidos */}
      <section className="mb-6">
        <h2 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Pedidos por status</h2>
        <div className="bg-zinc-900 rounded-xl divide-y divide-zinc-800">
          {Object.entries(data.ordersByStatus).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between px-4 py-3">
              <span className="text-zinc-400 text-sm">{translateStatus(status)}</span>
              <span className="text-white text-sm font-medium">{count}</span>
            </div>
          ))}
        </div>
      </section>

     {/* Top itens */}
      <section className="mb-6">
        <h2 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Itens mais vendidos</h2>
        <div className="bg-zinc-900 rounded-xl divide-y divide-zinc-800">
          {data.topItems.filter(i => i.quantitySold > 0).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between px-4 py-3">
              <div className="flex flex-col">
                <span className="text-white text-sm">{item.name}</span>
                <span className="text-zinc-500 text-xs">
                  {item.quantitySold} {item.quantitySold === 1 ? 'unidade' : 'unidades'}
                </span>
              </div>
              <span className="text-violet-400 text-sm font-medium">{formatBRL(item.totalRevenue)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Relatório com IA */}
      <section className="mb-6">
        <button
          onClick={() => navigate('/reports')}
          className="w-full bg-gradient-to-br from-violet-600 to-violet-800 rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:from-violet-500 hover:to-violet-700 transition-colors"
        >
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
            <i className="ti ti-sparkles text-white text-xl" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-white text-sm font-medium">Relatório semanal com IA</p>
            <p className="text-violet-100 text-xs">Análise, tendências e sugestões</p>
          </div>
          <i className="ti ti-chevron-right text-white text-xl" />
        </button>
      </section>

      {/* Vendas por dia da semana */}
      {data.salesByDayOfWeek.length > 0 && (
        <section className="mb-6">
          <h2 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Vendas por dia</h2>
          <div className="bg-zinc-900 rounded-xl divide-y divide-zinc-800">
            {data.salesByDayOfWeek.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3">
                <span className="text-zinc-400 text-sm">{day.dayOfWeek}</span>
                <div className="flex flex-col items-end">
                  <span className="text-white text-sm font-medium">{formatBRL(day.revenue)}</span>
                  <span className="text-zinc-500 text-xs">{day.orderCount} pedidos</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
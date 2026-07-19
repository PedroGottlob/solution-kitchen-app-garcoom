import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { type DashboardData, getDashboard } from '../../services/dashboardService'

function MetricCard({
  label,
  value,
  sub,
  subColor
}: {
  label: string
  value: string
  sub?: string
  subColor?: string
}) {
  return (
    <div className="bg-zinc-900 rounded-xl p-4 flex flex-col gap-1">
      <span className="text-zinc-500 text-xs">{label}</span>
      <span className="text-white text-xl font-medium">{value}</span>
      {sub && <span className={`text-xs ${subColor ?? 'text-zinc-500'}`}>{sub}</span>}
    </div>
  )
}

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatPercent(value: number): { text: string; color: string } {
  // Edge case: valores absurdos (divisão por zero no backend, ex: R$0 → R$1000 = infinito)
  if (!isFinite(value) || Math.abs(value) > 1000) {
    return { text: 'Sem base de comparação', color: 'text-zinc-500' }
  }
  if (value === 0) {
    return { text: '—', color: 'text-zinc-500' }
  }
  const sign = value > 0 ? '+' : ''
  const text = `${sign}${value.toFixed(0)}% vs anterior`
  const color = value > 0 ? 'text-emerald-400' : 'text-red-400'
  return { text, color }
}

function formatUpdated(from: Date, now: Date): string {
  const diffMs = now.getTime() - from.getTime()
  const min = Math.floor(diffMs / 60000)
  if (min < 1) return 'agora mesmo'
  if (min === 1) return 'há 1 minuto'
  if (min < 60) return `há ${min} minutos`
  const h = Math.floor(min / 60)
  if (h === 1) return 'há 1 hora'
  return `há ${h} horas`
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
  const navigate = useNavigate()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)
  const [now, setNow] = useState(new Date())

  function load() {
    setLoading(true)
    setError(false)
    getDashboard()
      .then(d => {
        setData(d)
        setLastFetch(new Date())
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
    // Atualiza o "há X min" a cada minuto
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center pb-20">
        <span className="text-zinc-500 text-sm">Carregando dashboard...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center pb-20 gap-4 px-5">
        <i className="ti ti-alert-circle text-zinc-600 text-4xl" />
        <p className="text-zinc-500 text-sm text-center">
          Erro ao carregar dados do dashboard.
        </p>
        <button
          onClick={load}
          className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium cursor-pointer hover:bg-violet-500 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  const revenueTodayPercent = formatPercent(data.revenueTodayVsYesterdayPercent)
  const revenueMonthPercent = formatPercent(data.revenueThisMonthVsLastMonthPercent)
  const statusEntries = Object.entries(data.ordersByStatus).filter(([, count]) => count > 0)

  return (
    <div className="min-h-screen bg-zinc-950 px-4 pt-6 pb-28">

      {/* Header com refresh */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-white text-lg font-medium">Dashboard</h1>
        <button
          onClick={load}
          disabled={loading}
          className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors disabled:opacity-50"
          title="Atualizar"
        >
          <i className={`ti ti-refresh text-zinc-400 text-sm ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Receita */}
      <section className="mb-6">
        <h2 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Receita</h2>
        <div className="grid grid-cols-2 gap-3">
          <MetricCard
            label="Hoje"
            value={formatBRL(data.revenueToday)}
            sub={revenueTodayPercent.text}
            subColor={revenueTodayPercent.color}
          />
          <MetricCard label="Ontem" value={formatBRL(data.revenueYesterday)} />
          <MetricCard
            label="Este mês"
            value={formatBRL(data.revenueThisMonth)}
            sub={revenueMonthPercent.text}
            subColor={revenueMonthPercent.color}
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

      {/* Status dos pedidos — só mostra status com pelo menos 1 pedido */}
      {statusEntries.length > 0 && (
        <section className="mb-6">
          <h2 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Pedidos por status</h2>
          <div className="bg-zinc-900 rounded-xl divide-y divide-zinc-800">
            {statusEntries.map(([status, count]) => (
              <div key={status} className="flex items-center justify-between px-4 py-3">
                <span className="text-zinc-400 text-sm">{translateStatus(status)}</span>
                <span className="text-white text-sm font-medium">{count}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Top itens com ranking */}
      {data.topItems.filter(i => i.quantitySold > 0).length > 0 && (
        <section className="mb-6">
          <h2 className="text-zinc-500 text-xs uppercase tracking-wider mb-3">Itens mais vendidos</h2>
          <div className="bg-zinc-900 rounded-xl divide-y divide-zinc-800">
            {data.topItems.filter(i => i.quantitySold > 0).map((item, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className={`text-xs font-medium w-6 text-center flex-shrink-0 ${
                    idx === 0 ? 'text-amber-400' :
                    idx === 1 ? 'text-zinc-300' :
                    idx === 2 ? 'text-orange-400' :
                    'text-zinc-500'
                  }`}>
                    #{idx + 1}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="text-white text-sm truncate">{item.name}</span>
                    <span className="text-zinc-500 text-xs">
                      {item.quantitySold} {item.quantitySold === 1 ? 'unidade' : 'unidades'}
                    </span>
                  </div>
                </div>
                <span className="text-violet-400 text-sm font-medium flex-shrink-0">
                  {formatBRL(item.totalRevenue)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

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

      {/* Timestamp */}
      {lastFetch && (
        <p className="text-center text-zinc-600 text-xs mt-4">
          Atualizado {formatUpdated(lastFetch, now)}
        </p>
      )}
    </div>
  )
}
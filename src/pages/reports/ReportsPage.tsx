import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { reportService, type WeeklyReport } from '../../services/reportService'

export function ReportsPage() {
  const navigate = useNavigate()
  const [report, setReport] = useState<WeeklyReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    setLoading(true)
    setError(null)
    try {
      const data = await reportService.getWeeklyReport()
      setReport(data)
    } catch (e) {
      console.error(e)
      setError('Não foi possível gerar o relatório. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const variation = report && report.previousWeek.revenue > 0
    ? ((report.currentWeek.revenue - report.previousWeek.revenue) / report.previousWeek.revenue) * 100
    : null

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col pb-24">

      {/* Header */}
      <div className="bg-accent-50 border-b border-accent-200 px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center cursor-pointer"
          >
            <i className="ti ti-arrow-left text-zinc-600" />
          </button>
          <div>
            <h1 className="text-zinc-900 text-xl font-medium">Relatório Semanal</h1>
            <p className="text-zinc-500 text-sm">Análise gerada por IA</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">

        {!report && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <i className="ti ti-sparkles text-accent-500 text-5xl" />
            <p className="text-zinc-600 text-center text-sm max-w-xs">
              Gere um relatório com análise de vendas, comparativo semanal e sugestões para o seu restaurante.
            </p>
            <button
              onClick={handleGenerate}
              className="py-3 px-6 rounded-xl bg-accent-600 text-white font-medium text-sm cursor-pointer hover:bg-accent-500 transition-colors flex items-center gap-2"
            >
              <i className="ti ti-sparkles" />
              Gerar relatório
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-accent-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm">Analisando os dados do restaurante...</p>
            <p className="text-zinc-500 text-xs">Isso pode levar alguns segundos</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        {report && !loading && (
          <>
            {/* Métricas da semana */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-accent-50 border border-accent-200 rounded-xl p-4">
                <p className="text-zinc-500 text-xs mb-1">Faturamento</p>
                <p className="text-zinc-900 text-lg font-medium">
                  R$ {report.currentWeek.revenue.toFixed(2)}
                </p>
                {variation !== null && (
                  <p className={`text-xs mt-1 ${variation >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {variation >= 0 ? '↑' : '↓'} {Math.abs(variation).toFixed(1)}% vs semana anterior
                  </p>
                )}
              </div>
              <div className="bg-accent-50 border border-accent-200 rounded-xl p-4">
                <p className="text-zinc-500 text-xs mb-1">Pedidos</p>
                <p className="text-zinc-900 text-lg font-medium">{report.currentWeek.orderCount}</p>
                <p className="text-zinc-500 text-xs mt-1">
                  Ticket médio: R$ {report.currentWeek.averageTicket.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Top itens */}
            {report.currentWeek.topItems.length > 0 && (
              <div className="bg-accent-50 border border-accent-200 rounded-xl p-4">
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">
                  Mais vendidos da semana
                </p>
                <div className="flex flex-col gap-2">
                  {report.currentWeek.topItems.slice(0, 5).map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-zinc-700 text-sm">
                        <span className="text-zinc-500 mr-2">{i + 1}.</span>
                        {item.name}
                      </span>
                      <span className="text-zinc-500 text-sm">{item.quantity}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Análise da IA */}
            <div className="bg-accent-50 border border-accent-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <i className="ti ti-sparkles text-accent-500" />
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
                  Análise
                </p>
              </div>
              <div className="text-zinc-700 text-sm leading-relaxed whitespace-pre-wrap">
                {report.analysis}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="py-3 rounded-xl bg-zinc-200 text-zinc-700 font-medium text-sm cursor-pointer hover:bg-zinc-300 transition-colors flex items-center justify-center gap-2"
            >
              <i className="ti ti-refresh" />
              Gerar novamente
            </button>
          </>
        )}
      </div>
    </div>
  )
}

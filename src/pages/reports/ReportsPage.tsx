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
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-24">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer"
          >
            <i className="ti ti-arrow-left text-zinc-400" />
          </button>
          <div>
            <h1 className="text-white text-xl font-medium">Relatório Semanal</h1>
            <p className="text-zinc-500 text-sm">Análise gerada por IA</p>
          </div>
        </div>
      </div>

      <div className="px-5 py-4 flex flex-col gap-4">

        {!report && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <i className="ti ti-sparkles text-violet-500 text-5xl" />
            <p className="text-zinc-400 text-center text-sm max-w-xs">
              Gere um relatório com análise de vendas, comparativo semanal e sugestões para o seu restaurante.
            </p>
            <button
              onClick={handleGenerate}
              className="py-3 px-6 rounded-xl bg-violet-600 text-white font-medium text-sm cursor-pointer hover:bg-violet-500 transition-colors flex items-center gap-2"
            >
              <i className="ti ti-sparkles" />
              Gerar relatório
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-zinc-500 text-sm">Analisando os dados do restaurante...</p>
            <p className="text-zinc-600 text-xs">Isso pode levar alguns segundos</p>
          </div>
        )}

        {error && (
          <div className="bg-red-950 border border-red-900 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {report && !loading && (
          <>
            {/* Métricas da semana */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-zinc-500 text-xs mb-1">Faturamento</p>
                <p className="text-white text-lg font-medium">
                  R$ {report.currentWeek.revenue.toFixed(2)}
                </p>
                {variation !== null && (
                  <p className={`text-xs mt-1 ${variation >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {variation >= 0 ? '↑' : '↓'} {Math.abs(variation).toFixed(1)}% vs semana anterior
                  </p>
                )}
              </div>
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-zinc-500 text-xs mb-1">Pedidos</p>
                <p className="text-white text-lg font-medium">{report.currentWeek.orderCount}</p>
                <p className="text-zinc-500 text-xs mt-1">
                  Ticket médio: R$ {report.currentWeek.averageTicket.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Top itens */}
            {report.currentWeek.topItems.length > 0 && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">
                  Mais vendidos da semana
                </p>
                <div className="flex flex-col gap-2">
                  {report.currentWeek.topItems.slice(0, 5).map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="text-zinc-300 text-sm">
                        <span className="text-zinc-600 mr-2">{i + 1}.</span>
                        {item.name}
                      </span>
                      <span className="text-zinc-500 text-sm">{item.quantity}x</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Análise da IA */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <i className="ti ti-sparkles text-violet-500" />
                <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
                  Análise
                </p>
              </div>
              <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                {report.analysis}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              className="py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium text-sm cursor-pointer hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
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
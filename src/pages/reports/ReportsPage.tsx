import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { jsPDF, GState } from 'jspdf'
import { reportService, type WeeklyReport } from '../../services/reportService'

// Converte o markdown simples que o modelo devolve (#, ##, **negrito**,
// listas, tabela) em linhas de texto pro jsPDF, que não renderiza HTML/MD
// nativamente. Não tenta ser um parser completo — só o suficiente pro
// formato fixo que o prompt do relatório pede.
function markdownToPdfLines(
  markdown: string
): { text: string; bold: boolean; heading: boolean; bullet: boolean; indented: boolean }[] {
  const lines = markdown.split('\n')
  const result: { text: string; bold: boolean; heading: boolean; bullet: boolean; indented: boolean }[] = []

  // Quando o modelo escreve um item de lista com a explicação na linha de
  // baixo, sem marcador próprio (ex.: "- **Item**\nExplicação..."), essa
  // linha de explicação precisa herdar o recuo do bullet — senão ela cai
  // solta na margem e quebra a ligação visual com o item. Uma linha em
  // branco entre elas indica um parágrafo novo de verdade, não continuação.
  let attachToBullet = false

  for (const raw of lines) {
    const line = raw.trim()
    if (!line || line === '---') {
      attachToBullet = false
      continue
    }

    const headingMatch = line.match(/^(#{1,3})\s+(.*)/)
    if (headingMatch) {
      attachToBullet = false
      // Título nível 1 (#) é redundante — o PDF já tem "Relatório Semanal"
      // e a seção "Análise" cobrindo esse papel; o modelo às vezes devolve
      // um também, o que duplicava o cabeçalho. Só nível 2/3 vira seção.
      if (headingMatch[1] === '#') continue
      result.push({ text: headingMatch[2].replace(/\*\*/g, ''), bold: true, heading: true, bullet: false, indented: false })
      continue
    }

    const listMatch = line.match(/^(?:[-*]|\d+\.)\s+(.*)/)
    const content = listMatch ? listMatch[1] : line
    const bullet = !!listMatch
    const indented = !bullet && attachToBullet
    attachToBullet = bullet || indented

    if (content.startsWith('|')) {
      attachToBullet = false
      const cells = content.split('|').map((c) => c.trim()).filter(Boolean)
      if (cells.every((c) => /^-+$/.test(c))) continue
      result.push({ text: cells.join('   |   ').replace(/\*\*/g, ''), bold: false, heading: false, bullet: false, indented: false })
      continue
    }

    result.push({ text: content.replace(/\*\*/g, ''), bold: false, heading: false, bullet, indented })
  }

  return result
}

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

  function handleExportPdf() {
    if (!report) return

    // Paleta oficial da identidade visual do Solution Kitchen.
    const BRAND_ORANGE: [number, number, number] = [234, 88, 12] // #EA580C
    const BRAND_GRAPHITE: [number, number, number] = [28, 25, 23] // #1C1917

    const doc = new jsPDF({ unit: 'pt', format: 'a4' })
    const marginX = 48
    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const maxWidth = pageWidth - marginX * 2
    let y = 56

    function ensureSpace(lineHeight: number) {
      if (y + lineHeight > pageHeight - 48) {
        doc.addPage()
        y = 56
      }
    }

    function writeLine(
      text: string,
      {
        bold = false,
        size = 10.5,
        color = BRAND_GRAPHITE,
        reserve = 0,
        indent = 0,
        prefixChar,
      }: {
        bold?: boolean
        size?: number
        color?: [number, number, number]
        reserve?: number
        indent?: number
        prefixChar?: string
      } = {}
    ) {
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setFontSize(size)
      doc.setTextColor(...color)
      const x = marginX + indent
      const wrapped = doc.splitTextToSize(text, maxWidth - indent) as string[]
      for (const [i, w] of wrapped.entries()) {
        // Numa linha de título, reserva espaço extra pra não deixar ele
        // "órfão" sozinho no fim da página, sem nenhuma linha de corpo
        // depois — se não couber os dois, os dois vão pra próxima página.
        ensureSpace(size * 1.4 + (i === 0 ? reserve : 0))
        // O marcador só entra na primeira linha visual — as linhas de
        // continuação (quebra de texto longo) ficam alinhadas com o texto,
        // não com o marcador, pra dar o "recuo pendurado" de lista de verdade.
        if (i === 0 && prefixChar) doc.text(prefixChar, marginX, y)
        doc.text(w, x, y)
        y += size * 1.4
      }
    }

    // Círculo laranja translúcido sangrando do canto superior direito —
    // mesmo recurso da capa do material de identidade visual.
    doc.saveGraphicsState()
    doc.setGState(new GState({ opacity: 0.08 }))
    doc.setFillColor(...BRAND_ORANGE)
    doc.circle(pageWidth + 40, 20, 170, 'F')
    doc.restoreGraphicsState()

    // Marca: o mesmo círculo + marcadores de QR code da logo do produto,
    // desenhado vetorialmente (fica nítido em qualquer zoom/impressão).
    const iconCx = marginX + 10
    const iconCy = y
    doc.setDrawColor(...BRAND_ORANGE)
    doc.setLineWidth(1.8)
    doc.circle(iconCx, iconCy, 10, 'S')
    doc.setFillColor(...BRAND_ORANGE)
    doc.roundedRect(iconCx - 4, iconCy - 4, 5, 5, 1, 1, 'F')
    doc.roundedRect(iconCx + 2, iconCy - 4, 3, 3, 0.8, 0.8, 'F')
    doc.roundedRect(iconCx - 4, iconCy + 2, 3, 3, 0.8, 0.8, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...BRAND_GRAPHITE)
    doc.text('Solution', marginX + 26, iconCy + 3)
    doc.setTextColor(...BRAND_ORANGE)
    doc.text('Kitchen', marginX + 26 + doc.getTextWidth('Solution '), iconCy + 3)
    y += 44

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(20)
    doc.setTextColor(...BRAND_GRAPHITE)
    doc.text('Relatório Semanal', marginX, y)
    y += 20

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9.5)
    doc.setTextColor(140)
    doc.text(`GERADO EM ${new Date(report.generatedAt).toLocaleString('pt-BR').toUpperCase()}`, marginX, y)
    y += 16
    doc.setDrawColor(...BRAND_ORANGE)
    doc.setLineWidth(1.2)
    doc.line(marginX, y, marginX + 64, y)
    y += 26

    writeLine(`Faturamento: R$ ${report.currentWeek.revenue.toFixed(2)}`, { bold: true, size: 12 })
    if (variation !== null) {
      writeLine(`${variation >= 0 ? 'Alta' : 'Queda'} de ${Math.abs(variation).toFixed(1)}% vs. semana anterior`, {
        color: variation >= 0 ? [5, 150, 105] : [220, 38, 38],
      })
    }
    writeLine(`Pedidos: ${report.currentWeek.orderCount}  ·  Ticket médio: R$ ${report.currentWeek.averageTicket.toFixed(2)}`)
    y += 6

    if (report.currentWeek.topItems.length > 0) {
      writeLine('Mais vendidos da semana', { bold: true, size: 12, color: BRAND_ORANGE, reserve: 20 })
      report.currentWeek.topItems.slice(0, 5).forEach((item, i) => {
        writeLine(`${i + 1}. ${item.name} — ${item.quantity}x`)
      })
      y += 6
    }

    writeLine('Análise', { bold: true, size: 12, color: BRAND_ORANGE, reserve: 20 })
    y += 2

    let prevGrouped = false
    for (const line of markdownToPdfLines(report.analysis)) {
      // Respiro extra na transição parágrafo -> lista e lista -> parágrafo,
      // senão os bullets colam direto no texto corrido e ficam difíceis
      // de escanear visualmente.
      const grouped = line.bullet || line.indented
      if (grouped !== prevGrouped && !line.heading) y += 3
      prevGrouped = grouped

      writeLine(line.text, {
        bold: line.bold,
        size: line.heading ? 12 : 10.5,
        color: line.heading ? BRAND_ORANGE : BRAND_GRAPHITE,
        reserve: line.heading ? 20 : 0,
        indent: grouped ? 14 : 0,
        prefixChar: line.bullet ? '•' : undefined,
      })
      if (line.heading) y += 2
    }

    // Numeração de página — só faz sentido saber o total depois de escrever
    // tudo, então carimba o rodapé numa segunda passada por página.
    const totalPages = doc.getNumberOfPages()
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(160)
      doc.text(`Solution Kitchen  ·  Página ${p} de ${totalPages}`, pageWidth - marginX, pageHeight - 28, { align: 'right' })
    }

    doc.save(`relatorio-semanal-${new Date(report.generatedAt).toISOString().slice(0, 10)}.pdf`)
  }

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
              <div className="text-zinc-700 text-sm leading-relaxed [&>*]:mb-3 [&>*:last-child]:mb-0">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => <h1 className="text-zinc-900 text-base font-semibold">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-zinc-900 text-sm font-semibold uppercase tracking-wide">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-zinc-900 text-sm font-semibold">{children}</h3>,
                    p: ({ children }) => <p>{children}</p>,
                    strong: ({ children }) => <strong className="text-zinc-900 font-semibold">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc pl-5 flex flex-col gap-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-5 flex flex-col gap-1">{children}</ol>,
                    li: ({ children }) => <li>{children}</li>,
                    hr: () => <hr className="border-accent-200" />,
                    table: ({ children }) => (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="border-b border-accent-200 pb-1 pr-3 text-zinc-500 text-xs font-medium uppercase">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="border-b border-accent-100 py-1 pr-3">{children}</td>
                    ),
                  }}
                >
                  {report.analysis}
                </ReactMarkdown>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportPdf}
                className="py-3 rounded-xl bg-accent-600 text-white font-medium text-sm cursor-pointer hover:bg-accent-500 transition-colors flex items-center justify-center gap-2"
              >
                <i className="ti ti-file-type-pdf" />
                Exportar PDF
              </button>
              <button
                onClick={handleGenerate}
                className="py-3 rounded-xl bg-zinc-200 text-zinc-700 font-medium text-sm cursor-pointer hover:bg-zinc-300 transition-colors flex items-center justify-center gap-2"
              >
                <i className="ti ti-refresh" />
                Gerar novamente
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { waitlistService, type WaitlistEntry } from '../../services/waitlistService'

interface FormState {
  customerName: string
  partySize: string
}

const emptyForm: FormState = { customerName: '', partySize: '2' }

export function WaitlistPage() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState<WaitlistEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirmedEntry, setConfirmedEntry] = useState<WaitlistEntry | null>(null)

  function load() {
    setLoading(true)
    waitlistService.getWaitlist()
      .then(setEntries)
      .catch(e => {
        console.error(e)
        toast.error('Falha ao carregar a fila de espera')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const waiting = entries.filter(e => e.status === 'Waiting')
  const called = entries.filter(e => e.status === 'Called')

  function adjustPartySize(delta: number) {
    setForm(f => {
      const current = Number(f.partySize) || 0
      const next = Math.max(1, Math.min(current + delta, 99))
      return { ...f, partySize: String(next) }
    })
  }

  async function handleSave() {
    const size = Number(form.partySize)
    if (!form.customerName.trim()) { toast.error('Informe o nome do cliente'); return }
    if (!form.partySize || isNaN(size) || size <= 0) { toast.error('Informe um número de pessoas válido'); return }

    setSaving(true)
    try {
      const entry = await waitlistService.createEntry({
        customerName: form.customerName.trim(),
        partySize: size,
      })
      setShowForm(false)
      setForm(emptyForm)
      setConfirmedEntry(entry)
      load()
    } catch (e) {
      console.error(e)
      toast.error('Falha ao cadastrar na fila')
    } finally {
      setSaving(false)
    }
  }

  async function handleCall(entryId: string) {
    try {
      await waitlistService.callEntry(entryId)
      toast.success('Senha chamada')
      load()
    } catch (e) {
      console.error(e)
      toast.error('Falha ao chamar a senha')
    }
  }

  async function handleSeat(entryId: string) {
    try {
      await waitlistService.seatEntry(entryId)
      toast.success('Cliente sentou na mesa')
      load()
    } catch (e) {
      console.error(e)
      toast.error('Falha ao atualizar')
    }
  }

  async function handleCancel(entryId: string) {
    try {
      await waitlistService.cancelEntry(entryId)
      toast('Senha cancelada')
      load()
    } catch (e) {
      console.error(e)
      toast.error('Falha ao cancelar')
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-28">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer">
          <i className="ti ti-arrow-left text-zinc-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-xl font-medium">Fila de espera</h1>
          <p className="text-zinc-500 text-sm">
            {waiting.length} esperando{called.length > 0 && ` · ${called.length} chamada${called.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button onClick={() => setShowForm(true)} className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:bg-violet-500 transition-colors">
          <i className="ti ti-plus text-white text-lg" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-zinc-500">Carregando fila...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <i className="ti ti-users text-zinc-600 text-4xl" />
          <p className="text-zinc-500">Ninguém na fila de espera</p>
          <p className="text-zinc-600 text-xs">Toque no botão + pra cadastrar um cliente</p>
        </div>
      ) : (
        <div className="px-5 py-4 flex flex-col gap-2">
          {[...called, ...waiting].map(entry => (
            <div key={entry.id} className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  Senha {entry.ticketNumber} · {entry.customerName}
                  {entry.status === 'Called' && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-400">Chamada</span>
                  )}
                </p>
                <p className="text-zinc-500 text-xs">{entry.partySize} pessoa{entry.partySize !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                {entry.status === 'Waiting' && (
                  <button onClick={() => handleCall(entry.id)} className="text-xs px-3 py-1.5 rounded-lg bg-violet-950 text-violet-400 border border-violet-900 hover:bg-violet-900 transition-colors cursor-pointer">
                    Chamar
                  </button>
                )}
                {entry.status === 'Called' && (
                  <button onClick={() => handleSeat(entry.id)} className="text-xs px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-900 hover:bg-emerald-900 transition-colors cursor-pointer">
                    Sentou
                  </button>
                )}
                <button onClick={() => handleCancel(entry.id)} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-red-950 transition-colors" title="Cancelar">
                  <i className="ti ti-x text-zinc-400 text-sm" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de cadastro */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-[60]" onClick={() => setShowForm(false)}>
          <div className="bg-zinc-900 rounded-t-2xl w-full p-5 pb-8 flex flex-col gap-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="text-white text-lg font-medium">Cadastrar na fila</h2>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-500 text-xs">Nome do cliente</label>
              <input type="text" value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))} placeholder="Ex: João" className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700" />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-500 text-xs">Quantidade de pessoas</label>
              <div className="flex items-center gap-2">
                <button onClick={() => adjustPartySize(-1)} className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors border border-zinc-700">
                  <i className="ti ti-minus text-zinc-400 text-sm" />
                </button>
                <input type="number" min="1" value={form.partySize} onChange={e => setForm(f => ({ ...f, partySize: e.target.value }))} placeholder="2" className="flex-1 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700 text-center" />
                <button onClick={() => adjustPartySize(1)} className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors border border-zinc-700">
                  <i className="ti ti-plus text-zinc-400 text-sm" />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium text-sm cursor-pointer hover:bg-zinc-700 transition-colors">Cancelar</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-medium text-sm cursor-pointer hover:bg-violet-500 transition-colors disabled:opacity-50">
                {saving ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação com QR code */}
      {confirmedEntry && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] px-5" onClick={() => setConfirmedEntry(null)}>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full text-center" onClick={e => e.stopPropagation()}>
            <p className="text-zinc-500 text-sm mb-1">Senha</p>
            <p className="text-5xl font-bold text-violet-400 mb-3">{confirmedEntry.ticketNumber}</p>
            <p className="text-white text-sm mb-4">{confirmedEntry.customerName} · {confirmedEntry.partySize} pessoa{confirmedEntry.partySize !== 1 ? 's' : ''}</p>

            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                `${import.meta.env.VITE_APP_CLIENT_URL}/fila/00000000-0000-0000-0000-000000000001/${confirmedEntry.id}`
              )}`}
              alt="QR code da senha"
              className="mx-auto mb-4 rounded-lg bg-white p-2"
            />

            <p className="text-zinc-500 text-xs mb-4">Peça pro cliente escanear pra acompanhar a fila pelo celular</p>
            <button onClick={() => setConfirmedEntry(null)} className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-medium text-sm cursor-pointer hover:bg-violet-500 transition-colors">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
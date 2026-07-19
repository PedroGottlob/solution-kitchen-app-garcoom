import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { tableService, type TableStatus, type CreateTablePayload } from '../../services/tableService'

interface FormState {
  number: string
  name: string
  capacity: string
}

const emptyForm: FormState = {
  number: '',
  name: '',
  capacity: '4',
}

export function TableManagementPage() {
  const navigate = useNavigate()
  const [tables, setTables] = useState<TableStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function load() {
    setLoading(true)
    tableService.getTables(true)
      .then(setTables)
      .catch(e => {
        console.error(e)
        toast.error('Falha ao carregar mesas')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const activeTables = useMemo(
    () => tables.filter(t => t.status !== 'Inactive'),
    [tables]
  )
  const inactiveTables = useMemo(
    () => tables.filter(t => t.status === 'Inactive'),
    [tables]
  )

  function nextNumber() {
    const numbers = tables.map(t => t.number)
    return numbers.length ? Math.max(...numbers) + 1 : 1
  }

  function openCreate() {
    setEditingId(null)
    setForm({ number: String(nextNumber()), name: '', capacity: '4' })
    setShowForm(true)
  }

  function openEdit(table: TableStatus) {
    setEditingId(table.id)
    setForm({
      number: String(table.number),
      name: table.name ?? '',
      capacity: String(table.capacity),
    })
    setShowForm(true)
  }

  function adjustCapacity(delta: number) {
    setForm(f => {
      const current = Number(f.capacity) || 0
      const next = Math.max(1, Math.min(current + delta, 99))
      return { ...f, capacity: String(next) }
    })
  }

  async function handleSave() {
    const num = Number(form.number)
    const cap = Number(form.capacity)

    if (!form.number || isNaN(num) || num <= 0) {
      toast.error('Informe um número de mesa válido')
      return
    }
    if (!form.capacity || isNaN(cap) || cap <= 0) {
      toast.error('Informe uma capacidade válida')
      return
    }

    // Valida número duplicado (só na criação; edição pode manter o mesmo número da mesa)
    if (!editingId) {
      const duplicate = tables.find(t => t.number === num)
      if (duplicate) {
        const suffix = duplicate.status === 'Inactive' ? ' (mesa desativada)' : ''
        toast.error(`Já existe uma Mesa ${num}${suffix}`)
        return
      }
    }

    setSaving(true)
    const payload: CreateTablePayload = {
      number: num,
      name: form.name.trim() || undefined,
      capacity: cap,
    }

    try {
      if (editingId) {
        await tableService.updateTable(editingId, payload)
        toast.success('Mesa atualizada')
      } else {
        await tableService.createTable(payload)
        toast.success('Mesa criada')
      }
      setShowForm(false)
      load()
    } catch (e) {
      console.error(e)
      toast.error('Falha ao salvar mesa')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(tableId: string) {
    try {
      await tableService.deactivateTable(tableId)
      toast.success('Mesa desativada')
      setConfirmDeleteId(null)
      load()
    } catch (e) {
      console.error(e)
      toast.error('Falha ao desativar mesa')
      setConfirmDeleteId(null)
    }
  }

  const confirmDeleteTable = confirmDeleteId
    ? tables.find(t => t.id === confirmDeleteId)
    : null

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-28">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer"
        >
          <i className="ti ti-arrow-left text-zinc-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-xl font-medium">Gestão de mesas</h1>
          <p className="text-zinc-500 text-sm">
            {activeTables.length} ativa{activeTables.length !== 1 ? 's' : ''}
            {inactiveTables.length > 0 && ` · ${inactiveTables.length} inativa${inactiveTables.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:bg-violet-500 transition-colors"
        >
          <i className="ti ti-plus text-white text-lg" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-zinc-500">Carregando mesas...</p>
        </div>
      ) : tables.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <i className="ti ti-armchair text-zinc-600 text-4xl" />
          <p className="text-zinc-500">Nenhuma mesa cadastrada</p>
          <p className="text-zinc-600 text-xs">Toque no botão + para adicionar a primeira</p>
        </div>
      ) : (
        <div className="px-5 py-4 flex flex-col gap-6">

          {/* Mesas ativas */}
          <div className="flex flex-col gap-2">
            <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
              Mesas ativas
            </p>
            {activeTables.length === 0 ? (
              <p className="text-zinc-600 text-xs italic py-2">Nenhuma mesa ativa</p>
            ) : (
              activeTables.map(table => (
                <div
                  key={table.id}
                  className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">
                      Mesa {String(table.number).padStart(2, '0')}
                      {table.name && <span className="text-zinc-500 font-normal"> · {table.name}</span>}
                      {table.status === 'Occupied' && (
                        <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-amber-950 text-amber-400">
                          Ocupada
                        </span>
                      )}
                    </p>
                    <p className="text-zinc-500 text-xs">
                      Capacidade: {table.capacity} pessoa{table.capacity !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(table)}
                      className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors"
                      title="Editar"
                    >
                      <i className="ti ti-pencil text-zinc-400 text-sm" />
                    </button>
                    <button
                      onClick={() => setConfirmDeleteId(table.id)}
                      className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-red-950 transition-colors"
                      title="Desativar"
                    >
                      <i className="ti ti-trash text-zinc-400 text-sm" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Mesas inativas */}
          {inactiveTables.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
                Mesas inativas
              </p>
              {inactiveTables.map(table => (
                <div
                  key={table.id}
                  className="bg-zinc-900/50 rounded-xl border border-zinc-800 px-4 py-3 flex items-center justify-between opacity-60"
                >
                  <div className="flex-1">
                    <p className="text-zinc-400 text-sm">
                      Mesa {String(table.number).padStart(2, '0')}
                      {table.name && <span className="text-zinc-500 font-normal"> · {table.name}</span>}
                    </p>
                    <p className="text-zinc-600 text-xs">
                      Capacidade: {table.capacity} pessoa{table.capacity !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
              ))}
              <p className="text-zinc-600 text-xs italic mt-1">
                Reativação estará disponível em breve
              </p>
            </div>
          )}
        </div>
      )}

      {/* Modal de formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-[60]" onClick={() => setShowForm(false)}>
          <div
            className="bg-zinc-900 rounded-t-2xl w-full p-5 pb-8 flex flex-col gap-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-white text-lg font-medium">
              {editingId ? 'Editar mesa' : 'Nova mesa'}
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-500 text-xs">Número da mesa</label>
              <input
                type="number"
                min="1"
                value={form.number}
                onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                placeholder="Ex: 13"
                disabled={!!editingId}
                className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed"
              />
              {editingId && (
                <p className="text-zinc-600 text-xs italic">Número não pode ser alterado</p>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-500 text-xs">Nome (opcional)</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: Varanda"
                className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-500 text-xs">Capacidade (pessoas)</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => adjustCapacity(-1)}
                  className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors border border-zinc-700"
                >
                  <i className="ti ti-minus text-zinc-400 text-sm" />
                </button>
                <input
                  type="number"
                  min="1"
                  value={form.capacity}
                  onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                  placeholder="4"
                  className="flex-1 bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700 text-center"
                />
                <button
                  onClick={() => adjustCapacity(1)}
                  className="w-9 h-9 rounded-lg bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors border border-zinc-700"
                >
                  <i className="ti ti-plus text-zinc-400 text-sm" />
                </button>
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-3 rounded-xl bg-zinc-800 text-zinc-300 font-medium text-sm cursor-pointer hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-medium text-sm cursor-pointer hover:bg-violet-500 transition-colors disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de desativação */}
      {confirmDeleteId && confirmDeleteTable && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] px-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 max-w-sm w-full">
            <h2 className="text-white text-lg font-medium mb-2">Desativar mesa?</h2>

            {confirmDeleteTable.status === 'Occupied' ? (
              <div className="mb-4 bg-amber-950/50 border border-amber-900 rounded-lg px-3 py-2 flex items-start gap-2">
                <i className="ti ti-alert-triangle text-amber-400 text-sm mt-0.5" />
                <p className="text-amber-400 text-xs">
                  Essa mesa está <b>ocupada</b>. Desativar pode deixar pedidos abertos sem acesso pelo garçom.
                </p>
              </div>
            ) : null}

            <p className="text-zinc-400 text-sm mb-5">
              A <b>Mesa {String(confirmDeleteTable.number).padStart(2, '0')}</b> será desativada.
              Ela sairá da tela do garçom e não poderá receber novos pedidos.
              Pedidos antigos continuam existindo no histórico.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-medium text-sm cursor-pointer hover:bg-zinc-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeactivate(confirmDeleteId)}
                className="flex-1 py-2.5 rounded-xl bg-red-900 text-red-100 font-medium text-sm cursor-pointer hover:bg-red-800 transition-colors"
              >
                Desativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
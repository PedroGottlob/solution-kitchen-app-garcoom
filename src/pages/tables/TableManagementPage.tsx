import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [tables, setTablesList] = useState<TableStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    tableService.getTables(true) // inclui inativas na tela de gestão
      .then(setTablesList)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

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

  async function handleSave() {
    if (!form.number || !form.capacity) return

    setSaving(true)
    const payload: CreateTablePayload = {
      number: Number(form.number),
      name: form.name.trim() || undefined,
      capacity: Number(form.capacity),
    }

    try {
      if (editingId) {
        await tableService.updateTable(editingId, payload)
      } else {
        await tableService.createTable(payload)
      }
      setShowForm(false)
      load()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(tableId: string) {
    try {
      await tableService.deactivateTable(tableId)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-28">

      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer"
        >
          <i className="ti ti-arrow-left text-zinc-400" />
        </button>
        <div className="flex-1">
          <h1 className="text-white text-xl font-medium">Gestão de mesas</h1>
          <p className="text-zinc-500 text-sm">{tables.length} mesa{tables.length !== 1 ? 's' : ''}</p>
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
      ) : (
        <div className="px-5 py-4 flex flex-col gap-2">
          {tables.map(table => (
            <div
              key={table.id}
              className={`bg-zinc-900 rounded-xl border px-4 py-3 flex items-center justify-between ${
                table.status === 'Inactive' ? 'border-zinc-800 opacity-50' : 'border-zinc-800'
              }`}
            >
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  Mesa {String(table.number).padStart(2, '0')}
                  {table.name && <span className="text-zinc-500 font-normal"> · {table.name}</span>}
                </p>
                <p className="text-zinc-500 text-xs">
                  Capacidade: {table.capacity} pessoa{table.capacity !== 1 ? 's' : ''}
                  {table.status === 'Inactive' && ' · Inativa'}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(table)}
                  className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors"
                >
                  <i className="ti ti-pencil text-zinc-400 text-sm" />
                </button>
                {table.status !== 'Inactive' && (
                  <button
                    onClick={() => handleDeactivate(table.id)}
                    className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-red-950 transition-colors"
                  >
                    <i className="ti ti-trash text-zinc-400 text-sm" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

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
                value={form.number}
                onChange={e => setForm(f => ({ ...f, number: e.target.value }))}
                placeholder="Ex: 13"
                className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700"
              />
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
              <input
                type="number"
                value={form.capacity}
                onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))}
                placeholder="4"
                className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700"
              />
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
    </div>
  )
}
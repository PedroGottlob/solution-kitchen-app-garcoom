import { useEffect, useState } from 'react'
import { menuService, type MenuItem, type CreateMenuItemPayload } from '../../services/menuService'

const categories = [
  { id: '00000000-0000-0000-0000-000000000101', name: 'Lanches' },
  { id: '00000000-0000-0000-0000-000000000102', name: 'Bebidas' },
  { id: '00000000-0000-0000-0000-000000000103', name: 'Porções' },
  { id: '00000000-0000-0000-0000-000000000104', name: 'Sobremesas' },
]

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface FormState {
  categoryId: string
  name: string
  description: string
  price: string
  cost: string
}

const emptyForm: FormState = {
  categoryId: categories[0].id,
  name: '',
  description: '',
  price: '',
  cost: '',
}

export function MenuManagementPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  function load() {
    setLoading(true)
    menuService.getMenuItems()
      .then(setItems)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  function openEdit(item: MenuItem) {
    setEditingId(item.id)
    setForm({
      categoryId: item.categoryId,
      name: item.name,
      description: item.description ?? '',
      price: String(item.price),
      cost: String(item.cost),
    })
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim() || !form.price || !form.cost) return

    setSaving(true)
    const payload: CreateMenuItemPayload = {
      categoryId: form.categoryId,
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      price: Number(form.price),
      cost: Number(form.cost),
    }

    try {
      if (editingId) {
        await menuService.updateMenuItem(editingId, payload)
      } else {
        await menuService.createMenuItem(payload)
      }
      setShowForm(false)
      load()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(itemId: string) {
    try {
      await menuService.deactivateMenuItem(itemId)
      load()
    } catch (e) {
      console.error(e)
    }
  }

  const grouped = items.reduce((acc: Record<string, MenuItem[]>, item) => {
    const key = item.categoryName
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-28">

      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-medium">Cardápio</h1>
          <p className="text-zinc-500 text-sm">{items.length} ite{items.length !== 1 ? 'ns' : 'm'}</p>
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
          <p className="text-zinc-500">Carregando cardápio...</p>
        </div>
      ) : (
        <div className="px-5 py-4 flex flex-col gap-6">
          {Object.entries(grouped).map(([categoryName, categoryItems]) => (
            <div key={categoryName} className="flex flex-col gap-2">
              <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
                {categoryName}
              </p>
              {categoryItems.map(item => (
                <div
                  key={item.id}
                  className={`bg-zinc-900 rounded-xl border px-4 py-3 flex items-center justify-between ${
                    item.status === 'Inactive' ? 'border-zinc-800 opacity-50' : 'border-zinc-800'
                  }`}
                >
                  <div className="flex-1">
                    <p className="text-white text-sm font-medium">{item.name}</p>
                    {item.description && (
                      <p className="text-zinc-500 text-xs">{item.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-violet-400 text-sm font-medium">
                        {formatBRL(item.price)}
                      </span>
                      <span className="text-zinc-600 text-xs">
                        Custo: {formatBRL(item.cost)} · Margem: {item.margin.toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(item)}
                      className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-zinc-700 transition-colors"
                    >
                      <i className="ti ti-pencil text-zinc-400 text-sm" />
                    </button>
                    {item.status !== 'Inactive' && (
                      <button
                        onClick={() => handleDeactivate(item.id)}
                        className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-red-950 transition-colors"
                      >
                        <i className="ti ti-trash text-zinc-400 text-sm" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
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
              {editingId ? 'Editar item' : 'Novo item'}
            </h2>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-500 text-xs">Categoria</label>
              <select
                value={form.categoryId}
                onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))}
                className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-500 text-xs">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ex: X-Burguer"
                className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-zinc-500 text-xs">Descrição (opcional)</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ex: Pão, hambúrguer, queijo"
                className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-zinc-500 text-xs">Preço de venda</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="0,00"
                  className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-zinc-500 text-xs">Custo (CMV)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.cost}
                  onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                  placeholder="0,00"
                  className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700"
                />
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
    </div>
  )
}
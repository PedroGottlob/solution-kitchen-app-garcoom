import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
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

function calcMargin(priceStr: string, costStr: string): number | null {
  const price = Number(priceStr)
  const cost = Number(costStr)
  if (!price || price <= 0) return null
  if (isNaN(cost) || cost < 0) return null
  return ((price - cost) / price) * 100
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
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  function load() {
    setLoading(true)
    menuService.getMenuItems()
      .then(setItems)
      .catch(e => {
        console.error(e)
        toast.error('Falha ao carregar cardápio')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  function openCreate(categoryId?: string) {
    setEditingId(null)
    setForm({ ...emptyForm, categoryId: categoryId ?? categories[0].id })
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
    // Validação com feedback visual
    if (!form.name.trim()) {
      toast.error('Informe o nome do item')
      return
    }
    if (!form.price || Number(form.price) <= 0) {
      toast.error('Informe um preço de venda válido')
      return
    }
    if (form.cost === '' || Number(form.cost) < 0) {
      toast.error('Informe o custo (pode ser 0)')
      return
    }

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
        toast.success('Item atualizado')
      } else {
        await menuService.createMenuItem(payload)
        toast.success('Item criado')
      }
      setShowForm(false)
      load()
    } catch (e) {
      console.error(e)
      toast.error('Falha ao salvar item')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeactivate(itemId: string) {
    try {
      await menuService.deactivateMenuItem(itemId)
      toast.success('Item removido do cardápio')
      setConfirmDeleteId(null)
      load()
    } catch (e) {
      console.error(e)
      toast.error('Falha ao remover item')
      setConfirmDeleteId(null)
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(i =>
      i.name.toLowerCase().includes(q) ||
      (i.description?.toLowerCase().includes(q) ?? false)
    )
  }, [items, search])

  const grouped = useMemo(() => {
    return filtered.reduce((acc: Record<string, MenuItem[]>, item) => {
      const key = item.categoryName
      if (!acc[key]) acc[key] = []
      acc[key].push(item)
      return acc
    }, {})
  }, [filtered])

  const currentMargin = calcMargin(form.price, form.cost)

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-28">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-white text-xl font-medium">Cardápio</h1>
            <p className="text-zinc-500 text-sm">
              {items.length} ite{items.length !== 1 ? 'ns' : 'm'}
            </p>
          </div>
          <button
            onClick={() => openCreate()}
            className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:bg-violet-500 transition-colors"
          >
            <i className="ti ti-plus text-white text-lg" />
          </button>
        </div>

        {/* Busca */}
        <div className="relative">
          <i className="ti ti-search text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 text-sm" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar item..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-violet-600"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <p className="text-zinc-500">Carregando cardápio...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <i className="ti ti-book text-zinc-600 text-4xl" />
          <p className="text-zinc-500">Nenhum item no cardápio</p>
          <p className="text-zinc-600 text-xs">Toque no botão + para adicionar o primeiro</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2">
          <i className="ti ti-search text-zinc-600 text-3xl" />
          <p className="text-zinc-500 text-sm">Nenhum item encontrado</p>
        </div>
      ) : (
        <div className="px-5 py-4 flex flex-col gap-6">
          {categories.map(cat => {
            const categoryItems = grouped[cat.name] ?? []
            // Se tem busca ativa e essa categoria não tem itens filtrados, esconde
            if (search.trim() && categoryItems.length === 0) return null

            return (
              <div key={cat.id} className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider">
                    {cat.name}
                  </p>
                  <button
                    onClick={() => openCreate(cat.id)}
                    className="text-zinc-500 hover:text-violet-400 text-xs cursor-pointer transition-colors flex items-center gap-1"
                  >
                    <i className="ti ti-plus text-xs" />
                    Novo em {cat.name.toLowerCase()}
                  </button>
                </div>

                {categoryItems.length === 0 ? (
                  <p className="text-zinc-600 text-xs italic py-2">
                    Nenhum item nesta categoria
                  </p>
                ) : (
                  categoryItems.map(item => (
                    <div
                      key={item.id}
                      className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{item.name}</p>
                        {item.description && (
                          <p className="text-zinc-500 text-xs">{item.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
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
                          title="Editar"
                        >
                          <i className="ti ti-pencil text-zinc-400 text-sm" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer hover:bg-red-950 transition-colors"
                          title="Remover"
                        >
                          <i className="ti ti-trash text-zinc-400 text-sm" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal de formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 flex items-end z-[60]" onClick={() => setShowForm(false)}>
          <div
            className="bg-zinc-900 rounded-t-2xl w-full p-5 pb-8 flex flex-col gap-4 max-h-[85vh] overflow-y-auto"
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
                  min="0"
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
                  min="0"
                  value={form.cost}
                  onChange={e => setForm(f => ({ ...f, cost: e.target.value }))}
                  placeholder="0,00"
                  className="bg-zinc-800 text-white text-sm rounded-lg px-3 py-2.5 outline-none border border-zinc-700"
                />
              </div>
            </div>

            {/* Margem em tempo real */}
            {currentMargin !== null && (
              <div className="bg-zinc-800 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-zinc-500 text-xs">Margem calculada</span>
                <span className={`text-sm font-medium ${
                  currentMargin < 30 ? 'text-red-400' :
                  currentMargin < 60 ? 'text-amber-400' :
                  'text-emerald-400'
                }`}>
                  {currentMargin.toFixed(1)}%
                </span>
              </div>
            )}

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

      {/* Modal de confirmação de deleção */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70] px-5">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 max-w-sm w-full">
            <h2 className="text-white text-lg font-medium mb-2">Remover item?</h2>
            <p className="text-zinc-400 text-sm mb-5">
              O item será removido do cardápio. Pedidos antigos com esse item continuam existindo, mas ele não poderá mais ser adicionado a novos pedidos.
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
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
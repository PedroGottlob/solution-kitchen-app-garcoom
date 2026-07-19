import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useCartStore } from '../../store/cartStore'
import { useTableStore } from '../../store/tableStore'
import { orderService } from '../../services/orderService'
import { menuService } from '../../services/menuService'
import type { MenuItem } from '../../services/menuService'
import type { Order } from '../../types'

export function NewOrderPage() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const { items, addItem, incrementItem, decrementItem, clearCart, total } = useCartStore()
  const { orders: allOrders, setOrders } = useTableStore()

  const [activeCategory, setActiveCategory] = useState('Todos')
  const [loading, setLoading] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [search, setSearch] = useState('')
  const [editingQty, setEditingQty] = useState<string | null>(null)

  useEffect(() => {
    menuService.getMenuItems().then(setMenuItems).catch(console.error)
  }, [])

  const categories = useMemo(
    () => ['Todos', ...Array.from(new Set(menuItems.map(i => i.categoryName)))],
    [menuItems]
  )

  const filtered = useMemo(() => {
    const byCategory = activeCategory === 'Todos'
      ? menuItems
      : menuItems.filter(i => i.categoryName === activeCategory)

    const q = search.trim().toLowerCase()
    if (!q) return byCategory
    return byCategory.filter(i => i.name.toLowerCase().includes(q))
  }, [menuItems, activeCategory, search])

  function getQuantity(itemId: string): number {
    return items.find(i => i.itemId === itemId)?.quantity ?? 0
  }

  function handleQtyInput(itemId: string, name: string, price: number, raw: string) {
    const parsed = parseInt(raw, 10)
    const target = isNaN(parsed) ? 0 : Math.max(0, Math.min(parsed, 99))
    const current = getQuantity(itemId)

    if (target === 0 && current > 0) {
      for (let i = 0; i < current; i++) decrementItem(itemId)
      return
    }

    if (current === 0 && target > 0) {
      addItem({ itemId, name, quantity: 1, unitPrice: price })
      for (let i = 1; i < target; i++) incrementItem(itemId)
      return
    }

    if (target > current) {
      for (let i = 0; i < target - current; i++) incrementItem(itemId)
    } else if (target < current) {
      for (let i = 0; i < current - target; i++) decrementItem(itemId)
    }
  }

  async function handleConfirm() {
    if (items.length === 0) return
    setLoading(true)

    const optimisticOrder: Order = {
      id: `optimistic-${Date.now()}`,
      tableId: tableId!,
      status: 'Pending',
      source: 'waiter',
      totalAmount: total(),
      createdAt: new Date().toISOString(),
      items: items.map(i => ({
        itemId: i.itemId,
        name: i.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      })),
    }

    setOrders([...allOrders, optimisticOrder])
    clearCart()
    navigate(`/tables/${tableId}`)

    try {
      await orderService.createOrder({
        tableId: tableId!,
        source: 'waiter',
        items: items.map(i => ({ 
          itemId: i.itemId,
          name: i.name,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      })
      // SignalR vai substituir o optimistic com o pedido real
    } catch (e) {
      console.error(e)
      setOrders(useTableStore.getState().orders.filter(o => o.id !== optimisticOrder.id))
      toast.error('Falha ao enviar pedido', {
        description: 'Tente novamente em alguns segundos.',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-36">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => { clearCart(); navigate(`/tables/${tableId}`) }}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer"
          >
            <i className="ti ti-arrow-left text-zinc-400" />
          </button>
          <div>
            <h1 className="text-white text-xl font-medium">Novo pedido</h1>
            <p className="text-zinc-500 text-sm">
              {items.length} ite{items.length !== 1 ? 'ns' : 'm'} · R$ {total().toFixed(2)}
            </p>
          </div>
        </div>

        {/* Busca */}
        <div className="relative mb-3">
          <i className="ti ti-search text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2 text-sm" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar no cardápio..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-violet-600"
          />
        </div>

        {/* Categorias */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs whitespace-nowrap border cursor-pointer transition-colors ${
                activeCategory === cat
                  ? 'bg-violet-950 text-violet-400 border-violet-900'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu */}
      <div className="px-5 py-4 flex flex-col gap-3">
        {menuItems.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-zinc-500">Carregando cardápio...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <i className="ti ti-search text-zinc-600 text-3xl" />
            <p className="text-zinc-500 text-sm">Nenhum item encontrado</p>
          </div>
        ) : (
          filtered.map(item => {
            const qty = getQuantity(item.id)
            const isEditing = editingQty === item.id

            return (
              <div key={item.id} className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3 flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium">{item.name}</p>
                  {item.description && (
                    <p className="text-zinc-500 text-xs">{item.description}</p>
                  )}
                  <p className="text-violet-400 text-sm font-medium mt-1">R$ {item.price.toFixed(2)}</p>
                </div>

                {qty === 0 ? (
                  <button
                    onClick={() => addItem({ itemId: item.id, name: item.name, quantity: 1, unitPrice: item.price })}
                    className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:bg-violet-500 transition-colors"
                  >
                    <i className="ti ti-plus text-white text-sm" />
                  </button>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => decrementItem(item.id)}
                      className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center cursor-pointer"
                    >
                      <i className="ti ti-minus text-white text-sm" />
                    </button>

                    {isEditing ? (
                      <input
                        type="number"
                        autoFocus
                        defaultValue={qty}
                        onBlur={e => {
                          handleQtyInput(item.id, item.name, item.price, e.target.value)
                          setEditingQty(null)
                        }}
                        onKeyDown={e => {
                          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                          if (e.key === 'Escape') setEditingQty(null)
                        }}
                        className="w-12 text-center bg-zinc-800 border border-violet-600 rounded text-white font-medium text-sm py-0.5 focus:outline-none"
                      />
                    ) : (
                      <button
                        onClick={() => setEditingQty(item.id)}
                        className="text-white font-medium text-sm w-8 text-center cursor-pointer hover:text-violet-400"
                        title="Clique para digitar a quantidade"
                      >
                        {qty}
                      </button>
                    )}

                    <button
                      onClick={() => incrementItem(item.id)}
                      className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center cursor-pointer hover:bg-violet-500 transition-colors"
                    >
                      <i className="ti ti-plus text-white text-sm" />
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Botão confirmar */}
      {items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 px-5 py-4 bg-zinc-950 border-t border-zinc-800">
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-medium text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-violet-500 transition-colors disabled:opacity-50"
          >
            <i className="ti ti-check text-lg" />
            {loading ? 'Enviando...' : `Confirmar pedido · R$ ${total().toFixed(2)}`}
          </button>
        </div>
      )}
    </div>
  )
}
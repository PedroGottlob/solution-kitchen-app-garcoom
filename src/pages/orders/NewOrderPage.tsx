import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'
import { orderService } from '../../services/orderService'
import type { MenuItem } from '../../types'

const mockMenu: MenuItem[] = [
  { id: '00000000-0000-0000-0000-000000000001', name: 'X-Burguer', price: 25.90, category: 'Lanches', description: 'Pão, carne, queijo e salada' },
  { id: '00000000-0000-0000-0000-000000000002', name: 'X-Bacon', price: 29.90, category: 'Lanches', description: 'Pão, carne, bacon e queijo' },
  { id: '00000000-0000-0000-0000-000000000003', name: 'X-Frango', price: 24.90, category: 'Lanches', description: 'Pão, frango grelhado e salada' },
  { id: '00000000-0000-0000-0000-000000000004', name: 'Coca-Cola', price: 8.00, category: 'Bebidas', description: 'Lata 350ml' },
  { id: '00000000-0000-0000-0000-000000000005', name: 'Suco de laranja', price: 10.00, category: 'Bebidas', description: 'Natural 400ml' },
  { id: '00000000-0000-0000-0000-000000000006', name: 'Água com gás', price: 6.00, category: 'Bebidas', description: 'Garrafa 500ml' },
  { id: '00000000-0000-0000-0000-000000000007', name: 'Batata frita', price: 18.00, category: 'Porções', description: 'Porção grande' },
  { id: '00000000-0000-0000-0000-000000000008', name: 'Onion rings', price: 20.00, category: 'Porções', description: 'Porção com molho' },
  { id: '00000000-0000-0000-0000-000000000009', name: 'Pastel de queijo', price: 9.50, category: 'Porções', description: 'Unidade' },
  { id: '00000000-0000-0000-0000-000000000010', name: 'Pudim', price: 12.00, category: 'Sobremesas', description: 'Com calda de caramelo' },
  { id: '00000000-0000-0000-0000-000000000011', name: 'Brownie', price: 14.00, category: 'Sobremesas', description: 'Com sorvete' },
]

const categories = ['Todos', ...Array.from(new Set(mockMenu.map(i => i.category)))]

export function NewOrderPage() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const { items, addItem, incrementItem, decrementItem, clearCart, total } = useCartStore()
  const [activeCategory, setActiveCategory] = useState('Todos')
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState<Record<string, string>>({})

  const filtered = activeCategory === 'Todos'
    ? mockMenu
    : mockMenu.filter(i => i.category === activeCategory)

  function getQuantity(itemId: string): number {
    return items.find(i => i.itemId === itemId)?.quantity ?? 0
  }

  async function handleConfirm() {
    if (items.length === 0) return
    setLoading(true)
    try {
      await orderService.createOrder({
        tableId: tableId!,
        source: 'waiter',
        items: items.map(i => ({ ...i, notes: notes[i.itemId] })),
      })
      clearCart()
      navigate(`/tables/${tableId}`)
    } catch (e) {
      console.error(e)
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
        {filtered.map(item => {
          const qty = getQuantity(item.id)
          return (
            <div key={item.id} className="bg-zinc-900 rounded-xl border border-zinc-800 px-4 py-3 flex items-center justify-between">
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{item.name}</p>
                <p className="text-zinc-500 text-xs">{item.description}</p>
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
                  <span className="text-white font-medium text-sm w-4 text-center">{qty}</span>
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
        })}
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
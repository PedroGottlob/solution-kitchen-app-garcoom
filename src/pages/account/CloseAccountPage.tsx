import { useNavigate, useParams } from 'react-router-dom'
import { useTableStore } from '../../store/tableStore'

const mockAccountOrders = [
  {
    id: 'cb28ed3d',
    items: [
      { name: 'X-Burguer', quantity: 2, unitPrice: 25.90, notes: 'sem cebola' },
      { name: 'Coca-Cola', quantity: 2, unitPrice: 8.00 },
    ]
  },
  {
    id: 'aaf51438',
    items: [
      { name: 'X-Burguer', quantity: 1, unitPrice: 25.90, notes: 'bem passado' },
    ]
  },
  {
    id: 'c0bdb115',
    items: [
      { name: 'Batata frita', quantity: 1, unitPrice: 18.00 },
      { name: 'Suco de laranja', quantity: 2, unitPrice: 10.00 },
    ]
  },
]

const paymentMethods = [
  { id: 'pix', label: 'PIX', icon: 'ti-qrcode' },
  { id: 'credit', label: 'Crédito', icon: 'ti-credit-card' },
  { id: 'debit', label: 'Débito', icon: 'ti-credit-card' },
  { id: 'cash', label: 'Dinheiro', icon: 'ti-cash' },
]

export function CloseAccountPage() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const { tables, updateTableStatus } = useTableStore()

  const table = tables.find(t => t.id === tableId)

  const allItems = mockAccountOrders.flatMap(o => o.items)
  const subtotal = allItems.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0)
  const total = subtotal

  function handleCloseAccount(method: string) {
    updateTableStatus(tableId!, 'free')
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-20">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/tables/${tableId}`)}
            className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center cursor-pointer"
          >
            <i className="ti ti-arrow-left text-zinc-400" />
          </button>
          <div>
            <h1 className="text-white text-xl font-medium">Fechar conta</h1>
            <p className="text-zinc-500 text-sm">
              Mesa {String(table?.number ?? '').padStart(2, '0')}
            </p>
          </div>
        </div>
      </div>

      {/* Resumo dos itens */}
      <div className="px-5 py-4">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">
          Resumo do consumo
        </p>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          {allItems.map((item, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-4 py-3 ${
                i < allItems.length - 1 ? 'border-b border-zinc-800' : ''
              }`}
            >
              <div>
                <p className="text-white text-sm">
                  <span className="text-violet-400">{item.quantity}× </span>
                  {item.name}
                </p>
                {item.notes && (
                  <p className="text-zinc-500 text-xs">{item.notes}</p>
                )}
              </div>
              <span className="text-zinc-300 text-sm">
                R$ {(item.unitPrice * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-700 bg-zinc-800">
            <span className="text-white font-medium">Total</span>
            <span className="text-white font-medium text-lg">
              R$ {total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Divisão de conta */}
      <div className="px-5 mb-4">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">
          Dividir conta
        </p>
        <div className="flex gap-3">
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              className="flex-1 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm cursor-pointer hover:border-violet-900 hover:text-violet-400 hover:bg-violet-950 transition-colors"
            >
              {n === 1 ? 'Sem dividir' : `÷ ${n}`}
            </button>
          ))}
        </div>
      </div>

      {/* Formas de pagamento */}
      <div className="px-5">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">
          Forma de pagamento
        </p>
        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map(method => (
            <button
              key={method.id}
              onClick={() => handleCloseAccount(method.id)}
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-4 flex flex-col items-center gap-2 cursor-pointer hover:border-violet-900 hover:bg-violet-950 transition-colors group"
            >
              <i className={`ti ${method.icon} text-2xl text-zinc-400 group-hover:text-violet-400`} />
              <span className="text-zinc-300 text-sm group-hover:text-violet-400">
                {method.label}
              </span>
              <span className="text-zinc-500 text-xs">
                R$ {total.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
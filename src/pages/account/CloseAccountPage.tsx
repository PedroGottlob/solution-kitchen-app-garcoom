import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTableStore } from '../../store/tableStore'
import { useOrders } from '../../hooks/useOrders'
import { paymentService, type PaymentMethod, type PaymentResponse } from '../../services/paymentService'
import { signalRService } from '../../services/signalRService'

const paymentMethods: { id: PaymentMethod; label: string; icon: string }[] = [
  { id: 'Pix', label: 'PIX', icon: 'ti-qrcode' },
  { id: 'CreditCard', label: 'Crédito', icon: 'ti-credit-card' },
  { id: 'DebitCard', label: 'Débito', icon: 'ti-credit-card' },
  { id: 'Cash', label: 'Dinheiro', icon: 'ti-cash' },
]

export function CloseAccountPage() {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const { tables, updateTableStatus } = useTableStore()
  const { orders } = useOrders(tableId)
  const [loading, setLoading] = useState(false)
  const [split, setSplit] = useState(1)
  const [pixPayment, setPixPayment] = useState<PaymentResponse | null>(null)

  const table = tables.find(t => t.id === tableId)
  const allItems = orders.flatMap(o => o.items)
  const total = orders.reduce((acc, o) => acc + o.totalAmount, 0)
  const splitTotal = total / split

  useEffect(() => {
    if (!pixPayment || !tableId) return

    signalRService.joinTable(tableId)

    const unsubscribe = signalRService.onPaymentConfirmed((data: string) => {
      const payload = JSON.parse(data)
      console.log('PaymentConfirmed recebido:', payload)
      console.log('tableId local:', tableId)
      console.log('são iguais?', payload.tableId === tableId)
      if (payload.tableId === tableId) {
        updateTableStatus(tableId, 'free', 0)
        navigate('/')
      }
    })

    return () => {
      unsubscribe()
      signalRService.leaveTable(tableId)
    }
  }, [pixPayment, tableId])

  async function handleCloseAccount(method: PaymentMethod) {
    if (!tableId) return
    setLoading(true)
    try {
      const payment = await paymentService.createPayment({
        tableId,
        amount: total,
        method
      })

      if (method === 'Pix') {
        setPixPayment(payment)
        return
      }

      updateTableStatus(tableId, 'free', 0)
      navigate('/')
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Tela do QR Code PIX
  if (pixPayment) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center px-5 gap-6">
        <div className="text-center">
          <h1 className="text-white text-xl font-medium mb-1">Pague com PIX</h1>
          <p className="text-zinc-500 text-sm">Escaneie o QR Code abaixo</p>
        </div>

        {pixPayment.pixQrCodeBase64 && (
          <div className="bg-white p-4 rounded-2xl">
            <img
              src={`data:image/png;base64,${pixPayment.pixQrCodeBase64}`}
              alt="QR Code PIX"
              className="w-56 h-56"
            />
          </div>
        )}

        <div className="w-full bg-zinc-900 rounded-xl p-4">
          <p className="text-zinc-500 text-xs mb-2">Copia e cola</p>
          <p className="text-white text-xs break-all">{pixPayment.pixQrCode}</p>
        </div>

        <p className="text-violet-400 text-2xl font-medium">
          R$ {total.toFixed(2)}
        </p>

        <p className="text-zinc-500 text-sm">Aguardando pagamento...</p>

        <button
          onClick={() => setPixPayment(null)}
          className="text-zinc-500 text-sm underline cursor-pointer"
        >
          Voltar
        </button>
      </div>
    )
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
          {allItems.length === 0 ? (
            <div className="px-4 py-6 text-center text-zinc-500 text-sm">
              Carregando pedidos...
            </div>
          ) : (
            allItems.map((item, i) => (
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
            ))
          )}
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
              onClick={() => setSplit(n)}
              className={`flex-1 py-2.5 rounded-xl border text-sm cursor-pointer transition-colors ${
                split === n
                  ? 'bg-violet-950 border-violet-900 text-violet-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-violet-900 hover:text-violet-400 hover:bg-violet-950'
              }`}
            >
              {n === 1 ? 'Sem dividir' : `÷ ${n}`}
            </button>
          ))}
        </div>
        {split > 1 && (
          <p className="text-zinc-500 text-xs mt-2 text-center">
            R$ {splitTotal.toFixed(2)} por pessoa
          </p>
        )}
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
              disabled={loading}
              className="bg-zinc-900 border border-zinc-800 rounded-xl py-4 flex flex-col items-center gap-2 cursor-pointer hover:border-violet-900 hover:bg-violet-950 transition-colors group disabled:opacity-50"
            >
              <i className={`ti ${method.icon} text-2xl text-zinc-400 group-hover:text-violet-400`} />
              <span className="text-zinc-300 text-sm group-hover:text-violet-400">
                {method.label}
              </span>
              <span className="text-zinc-500 text-xs">
                R$ {splitTotal.toFixed(2)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
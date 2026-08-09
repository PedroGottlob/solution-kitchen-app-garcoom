import { useEffect } from 'react'
import { toast } from 'sonner'
import { signalRService } from '../services/signalRService'
import { useNotificationStore } from '../store/notificationStore'

const methodLabels: Record<string, string> = {
  CreditCard: 'crédito',
  DebitCard: 'débito',
}

/**
 * Ouve pedidos de pagamento no cartão feitos pelo cliente (app-client) via
 * SignalR e transforma em notificação + toast pro garçom levar a maquininha.
 *
 * IMPORTANTE: deve ser montado uma única vez, no App.tsx, depois da
 * autenticação — mesmo cuidado do useOrderNotifications.
 */
export function usePaymentRequestNotifications() {
  const addNotification = useNotificationStore(s => s.addNotification)

  useEffect(() => {
    const unsubscribe = signalRService.onCardPaymentRequested((data: string) => {
      let payload: { tableId: string; tableNumber: number; method: string }
      try {
        payload = JSON.parse(data)
      } catch {
        return
      }

      const tableLabel = payload.tableNumber > 0
        ? `Mesa ${String(payload.tableNumber).padStart(2, '0')}`
        : 'Mesa'
      const methodLabel = methodLabels[payload.method] ?? payload.method

      addNotification({
        type: 'payment_requested',
        title: 'Pedido de pagamento',
        message: `${tableLabel} quer pagar no ${methodLabel} — leve a maquininha`,
        tableNumber: payload.tableNumber,
      })

      toast.info('Pedido de pagamento', {
        description: `${tableLabel} — ${methodLabel}, leve a maquininha até lá`,
      })
    })

    return () => {
      unsubscribe()
    }
  }, [addNotification])
}

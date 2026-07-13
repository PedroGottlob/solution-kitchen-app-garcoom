import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import type { Order } from '../types'
import { signalRService } from '../services/signalRService'
import { useNotificationStore } from '../store/notificationStore'
import { useTableStore } from '../store/tableStore'

function mapOrder(raw: any): Order {
  return {
    id: raw.id ?? raw.Id,
    tableId: raw.tableId ?? raw.TableId,
    status: raw.status ?? raw.Status,
    source: raw.source ?? raw.Source,
    totalAmount: raw.totalAmount ?? raw.TotalAmount,
    createdAt: raw.createdAt ?? raw.CreatedAt,
    items: (raw.items ?? raw.Items ?? []).map((i: any) => ({
      itemId: i.itemId ?? i.ItemId,
      name: i.name ?? i.Name,
      quantity: i.quantity ?? i.Quantity,
      unitPrice: i.unitPrice ?? i.UnitPrice,
      notes: i.notes ?? i.Notes,
    })),
  }
}

/**
 * Ouve as atualizações de pedidos via SignalR e dispara notificações
 * apenas em transições reais de status (Ready, Cancelled).
 *
 * IMPORTANTE: deve ser montado uma única vez, no App.tsx, depois da
 * autenticação. Caso contrário, cada instância do hook duplica as
 * notificações.
 */
export function useOrderNotifications() {
  const addNotification = useNotificationStore(s => s.addNotification)
  const tables = useTableStore(s => s.tables)

  // Guarda o último status conhecido de cada pedido — evita disparar duas vezes
  // pelo mesmo evento e evita disparar na primeira carga (quando o "anterior" ainda é undefined).
  const lastKnownStatus = useRef<Map<string, Order['status']>>(new Map())
  const primed = useRef(false)

  // Ref para a lista atual de mesas — o listener é registrado uma vez e não pode
  // depender do array de mesas (que muda) sem re-registrar. Usamos ref para ler o valor atual.
  const tablesRef = useRef(tables)
  useEffect(() => { tablesRef.current = tables }, [tables])

  useEffect(() => {
    const unsubscribe = signalRService.onOrdersUpdated((data: string) => {
      let orders: Order[] = []
      try {
        const raw = JSON.parse(data)
        orders = Array.isArray(raw) ? raw.map(mapOrder) : []
      } catch {
        return
      }

      if (!primed.current) {
        for (const order of orders) {
          lastKnownStatus.current.set(order.id, order.status)
        }
        primed.current = true
        return
      }

      for (const order of orders) {
        const previous = lastKnownStatus.current.get(order.id)
        lastKnownStatus.current.set(order.id, order.status)

        if (previous === order.status) continue
        if (previous === undefined) continue // pedido novo — poderia virar 'new_order' no futuro

        const table = tablesRef.current.find(t => t.id === order.tableId)
        const tableNumber = table?.number ?? 0
        const tableLabel = tableNumber > 0
          ? `Mesa ${String(tableNumber).padStart(2, '0')}`
          : 'Mesa'

        if (order.status === 'Ready') {
          addNotification({
            type: 'order_ready',
            title: 'Pedido pronto!',
            message: `${tableLabel} — pedido pronto para servir`,
            tableNumber,
          })
          toast.success('Pedido pronto!', {
            description: `${tableLabel} — pronto para servir`,
          })
        } else if (order.status === 'Cancelled') {
          addNotification({
            type: 'order_cancelled',
            title: 'Pedido cancelado',
            message: `${tableLabel} — pedido #${order.id.slice(0, 6).toUpperCase()} foi cancelado`,
            tableNumber,
          })
          toast.error('Pedido cancelado', {
            description: `${tableLabel} — #${order.id.slice(0, 6).toUpperCase()}`,
          })
        }
      }
    })

    return () => {
      unsubscribe()
    }
  }, [addNotification])
}
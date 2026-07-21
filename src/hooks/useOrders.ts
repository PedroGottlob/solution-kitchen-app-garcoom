import { useEffect, useState } from 'react'
import type { Order } from '../types'
import { signalRService } from '../services/signalRService'
import { orderService } from '../services/orderService'

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
      selectedOptions: (i.selectedOptions ?? i.SelectedOptions ?? []).map((o: any) => ({
        name: o.name ?? o.Name,
        additionalCost: o.additionalCost ?? o.AdditionalCost ?? 0,
      })),
    })),
  }
}

export function useOrders(tableId?: string) {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    if (tableId) {
      signalRService.joinTable(tableId)
    }

    // Busca inicial via REST — sem ela, a lista fica vazia até o próximo
    // evento SignalR chegar (causa do "flash de R$0" no CloseAccountPage)
    let cancelled = false
    const fetchInitial = tableId
      ? orderService.getOrdersByTable(tableId)
      : orderService.getAllOrders()

    fetchInitial
      .then(initial => {
        if (!cancelled) setOrders(initial.map(mapOrder))
      })
      .catch(e => console.error('[useOrders] Erro na busca inicial:', e))

    const unsubscribe = signalRService.onOrdersUpdated((data: string) => {
      try {
        const raw = JSON.parse(data)
        const all = Array.isArray(raw) ? raw.map(mapOrder) : []
        setOrders(all)
      } catch (e) {
        console.error('[useOrders] Erro ao parsear orders:', e)
      }
    })

    return () => {
      cancelled = true
      unsubscribe()
      if (tableId) signalRService.leaveTable(tableId)
    }
  }, [tableId])

  const filtered = tableId
    ? orders.filter(o => o.tableId === tableId)
    : orders

  return { orders: filtered, connected: true, error: null }
}
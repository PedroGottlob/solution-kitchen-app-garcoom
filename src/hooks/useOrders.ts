import { useEffect, useState } from 'react'
import type { Order } from '../types'
import { signalRService } from '../services/signalRService'

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

export function useOrders(tableId?: string) {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    console.log(`[useOrders] Montando hook para tableId=${tableId ?? 'ALL'}`)

    if (tableId) {
      signalRService.joinTable(tableId)
      console.log(`[useOrders] joinTable chamado: ${tableId}`)
    }

    const unsubscribe = signalRService.onOrdersUpdated((data: string) => {
      console.log(`[useOrders] Evento OrdersUpdated recebido (tableId=${tableId ?? 'ALL'})`)
      try {
        const raw = JSON.parse(data)
        const all = Array.isArray(raw) ? raw.map(mapOrder) : []
        const relevantOrder = tableId ? all.find(o => o.tableId === tableId) : null
        if (relevantOrder) {
          console.log(`[useOrders] Pedido relevante encontrado: ${relevantOrder.id} status=${relevantOrder.status}`)
        }
        setOrders(all)
        console.log(`[useOrders] setOrders chamado com ${all.length} pedidos`)
      } catch (e) {
        console.error('[useOrders] Erro ao parsear orders:', e)
      }
    })

    console.log(`[useOrders] Listener registrado para tableId=${tableId ?? 'ALL'}`)

    return () => {
      console.log(`[useOrders] Desmontando hook, removendo listener (tableId=${tableId ?? 'ALL'})`)
      unsubscribe()
      if (tableId) signalRService.leaveTable(tableId)
    }
  }, [tableId])

  const filtered = tableId
    ? orders.filter(o => o.tableId === tableId)
    : orders

  return { orders: filtered, connected: true, error: null }
}
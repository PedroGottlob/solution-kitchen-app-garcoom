import { useEffect } from 'react'
import type { Order } from '../types'
import { signalRService } from '../services/signalRService'
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

export function useOrders(tableId?: string) {
  const { orders, setOrders } = useTableStore()

  const filtered = tableId
    ? orders.filter(o => o.tableId === tableId)
    : orders

  useEffect(() => {
    if (tableId) {
      signalRService.joinTable(tableId)
    }

    const unsubscribe = signalRService.onOrdersUpdated((data: string) => {
      try {
        const raw = JSON.parse(data)
        const allOrders = Array.isArray(raw) ? raw.map(mapOrder) : []
        setOrders(allOrders)
      } catch (e) {
        console.error('Erro ao parsear mensagem SignalR:', e)
      }
    })

    return () => {
      unsubscribe()
      if (tableId) signalRService.leaveTable(tableId)
    }
  }, [tableId])

  return { orders: filtered, connected: true, error: null }
}
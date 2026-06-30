import { useEffect, useState } from 'react'
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
  const storedOrders = useTableStore(state => state.orders)
  const setStoredOrders = useTableStore(state => state.setOrders)
  const [localOrders, setLocalOrders] = useState<Order[]>(storedOrders)

  useEffect(() => {
    setLocalOrders(storedOrders)
  }, [storedOrders])

  useEffect(() => {
    if (tableId) signalRService.joinTable(tableId)

    const unsubscribe = signalRService.onOrdersUpdated((data: string) => {
      try {
        const raw = JSON.parse(data)
        const all = Array.isArray(raw) ? raw.map(mapOrder) : []
        setLocalOrders(all)
        setStoredOrders(all)
      } catch (e) {
        console.error('Erro ao parsear orders:', e)
      }
    })

    return () => {
      unsubscribe()
      if (tableId) signalRService.leaveTable(tableId)
    }
  }, [tableId])

  const filtered = tableId
    ? localOrders.filter(o => o.tableId === tableId)
    : localOrders

  return { orders: filtered, connected: true, error: null }
}
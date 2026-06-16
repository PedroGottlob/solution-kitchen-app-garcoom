import { useEffect, useState } from 'react'
import type { Order } from '../types'

const BASE_URL = import.meta.env.VITE_BFF_OPERACIONAL_URL || 'http://localhost:5159'
const TENANT_ID = import.meta.env.VITE_TENANT_ID || '00000000-0000-0000-0000-000000000001'

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
  const [connected, setConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = tableId
      ? `${BASE_URL}/api/orders/stream?tableId=${tableId}&tenantId=${TENANT_ID}`
      : `${BASE_URL}/api/orders/stream?tenantId=${TENANT_ID}`

    const source = new EventSource(url)

    source.onmessage = (event: MessageEvent) => {
      try {
        const raw = JSON.parse(event.data)
        const data = Array.isArray(raw) ? raw.map(mapOrder) : []
        setOrders(data)
        setConnected(true)
        setError(null)
      } catch (e) {
        console.error('Erro ao parsear SSE:', e)
      }
    }

    source.onerror = () => {
      setConnected(false)
      setError('Conexão perdida. Reconectando...')
    }

    return () => source.close()
  }, [tableId])

  return { orders, connected, error }
}
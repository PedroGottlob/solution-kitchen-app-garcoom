import { bffOperacional } from './api'
import type { Order, CreateOrderDto } from '../types'

export const orderService = {
  async createOrder(dto: CreateOrderDto): Promise<Order> {
    const { data } = await bffOperacional.post<Order>('/api/orders', dto)
    return data
  },

  async getOrder(orderId: string): Promise<Order> {
    const { data } = await bffOperacional.get<Order>(`/api/orders/${orderId}`)
    return data
  },

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    const { data } = await bffOperacional.get<Order[]>(`/api/orders?tableId=${tableId}`)
    return data
  },

  async getAllOrders(): Promise<Order[]> {
    const { data } = await bffOperacional.get<Order[]>('/api/orders')
    return data
  },

  async updateStatus(orderId: string, status: string): Promise<void> {
    await bffOperacional.patch(`/api/orders/${orderId}/status`, { status })
  },
}
export interface Table {
  id: string
  number: number
  status: 'free' | 'occupied' | 'ready'
  orderCount?: number
}

export interface OrderItem {
  itemId: string
  name: string
  quantity: number
  unitPrice: number
  notes?: string
}

export interface Order {
  id: string
  tableId: string
  status: 'Pending' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled'
  source: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

export interface CreateOrderItemDto {
  itemId: string
  name: string
  quantity: number
  unitPrice: number
  notes?: string
}

export interface CreateOrderDto {
  tableId: string
  source: 'waiter'
  items: CreateOrderItemDto[]
}

export interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description?: string
}
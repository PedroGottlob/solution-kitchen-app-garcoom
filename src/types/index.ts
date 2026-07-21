export interface Table {
  id: string
  number: number
  name?: string
  status: 'free' | 'occupied' | 'ready'
  capacity?: number
  orderCount?: number
}

export interface SelectedOption {
  name: string
  additionalCost: number
}

export interface OrderItem {
  itemId: string
  name: string
  quantity: number
  unitPrice: number
  notes?: string
  selectedOptions?: SelectedOption[]
}

export interface Order {
  id: string
  tableId: string
  status: 'Pending' | 'Confirmed' | 'Preparing' | 'Ready' | 'Delivered' | 'Cancelled' | 'Closed'
  source: string
  totalAmount: number
  createdAt: string
  items: OrderItem[]
}

export interface CreateSelectedOptionDto {
  name: string
  additionalCost: number
}

export interface CreateOrderItemDto {
  itemId: string
  name: string
  quantity: number
  unitPrice: number
  notes?: string
  selectedOptions?: CreateSelectedOptionDto[]
}

export interface CreateOrderDto {
  tableId: string
  tableNumber?: number
  source: 'waiter'
  items: CreateOrderItemDto[]
}

export interface MenuItemOption {
  id: string
  name: string
  additionalCost: number
  isDefault: boolean
}

export interface MenuItem {
  id: string
  name: string
  price: number
  category: string
  description?: string
  options?: MenuItemOption[]
}
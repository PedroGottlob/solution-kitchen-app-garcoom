import { create } from 'zustand'
import type { CreateOrderItemDto } from '../types'

interface CartStore {
  items: CreateOrderItemDto[]
  addItem: (item: CreateOrderItemDto) => void
  removeItem: (itemId: string) => void
  incrementItem: (itemId: string) => void
  decrementItem: (itemId: string) => void
  clearCart: () => void
  total: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find(i => i.itemId === item.itemId)
      if (existing) {
        return {
          items: state.items.map(i =>
            i.itemId === item.itemId ? { ...i, quantity: i.quantity + 1 } : i
          )
        }
      }
      return { items: [...state.items, { ...item, quantity: 1 }] }
    }),

  removeItem: (itemId) =>
    set((state) => ({
      items: state.items.filter(i => i.itemId !== itemId)
    })),

  incrementItem: (itemId) =>
    set((state) => ({
      items: state.items.map(i =>
        i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
      )
    })),

  decrementItem: (itemId) =>
    set((state) => ({
      items: state.items
        .map(i => i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i)
        .filter(i => i.quantity > 0)
    })),

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0),
}))
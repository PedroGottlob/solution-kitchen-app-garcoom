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

function itemTotalUnitPrice(item: CreateOrderItemDto): number {
  const optionsCost = (item.selectedOptions ?? []).reduce((acc, o) => acc + o.additionalCost, 0)
  return item.unitPrice + optionsCost
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (item) =>
    set((state) => {
      // Itens com opções diferentes são tratados como itens separados
      const existing = state.items.find(i =>
        i.itemId === item.itemId &&
        JSON.stringify(i.selectedOptions ?? []) === JSON.stringify(item.selectedOptions ?? [])
      )
      if (existing) {
        return {
          items: state.items.map(i =>
            i === existing ? { ...i, quantity: i.quantity + 1 } : i
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

  total: () => get().items.reduce((acc, i) => acc + itemTotalUnitPrice(i) * i.quantity, 0),
}))
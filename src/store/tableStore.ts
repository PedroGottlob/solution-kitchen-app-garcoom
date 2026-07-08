import { create } from 'zustand'
import type { Table, Order } from '../types'

interface TableStore {
  tables: Table[]
  selectedTable: Table | null
  orders: Order[]
  setTables: (tables: Table[]) => void
  selectTable: (table: Table) => void
  clearSelection: () => void
  updateTableStatus: (tableId: string, status: Table['status'], orderCount?: number) => void
  setOrders: (orders: Order[]) => void
}

export const useTableStore = create<TableStore>((set) => ({
  tables: [],
  selectedTable: null,
  orders: [],
  setTables: (tables) => set({ tables }),
  selectTable: (table) => set({ selectedTable: table }),
  clearSelection: () => set({ selectedTable: null }),
  updateTableStatus: (tableId, status, orderCount?) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status, orderCount: orderCount ?? t.orderCount } : t
      ),
    })),
  setOrders: (orders) => set({ orders }),
}))
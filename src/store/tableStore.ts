import { create } from 'zustand'
import type { Table } from '../types'

interface TableStore {
  tables: Table[]
  selectedTable: Table | null
  setTables: (tables: Table[]) => void
  selectTable: (table: Table) => void
  clearSelection: () => void
  updateTableStatus: (tableId: string, status: Table['status'], orderCount?: number) => void
}

export const useTableStore = create<TableStore>((set) => ({
  tables: [
    { id: '00000000-0000-0000-0000-000000000001', number: 1, status: 'free' },
    { id: '00000000-0000-0000-0000-000000000002', number: 2, status: 'free' },
    { id: '00000000-0000-0000-0000-000000000003', number: 3, status: 'free' },
    { id: '00000000-0000-0000-0000-000000000004', number: 4, status: 'free' },
    { id: '00000000-0000-0000-0000-000000000005', number: 5, status: 'free' },
    { id: '00000000-0000-0000-0000-000000000006', number: 6, status: 'free' },
    { id: '00000000-0000-0000-0000-000000000007', number: 7, status: 'free' },
    { id: '00000000-0000-0000-0000-000000000008', number: 8, status: 'free' },
    { id: '00000000-0000-0000-0000-000000000009', number: 9, status: 'free' },
    { id: '00000000-0000-0000-0000-000000000010', number: 10, status: 'free' },
    { id: '00000000-0000-0000-0000-000000000011', number: 11, status: 'free' },
    { id: '00000000-0000-0000-0000-000000000012', number: 12, status: 'free' },
  ],
  selectedTable: null,
  setTables: (tables) => set({ tables }),
  selectTable: (table) => set({ selectedTable: table }),
  clearSelection: () => set({ selectedTable: null }),
  updateTableStatus: (tableId, status, orderCount?) =>
    set((state) => ({
      tables: state.tables.map((t) =>
        t.id === tableId ? { ...t, status, orderCount: orderCount ?? t.orderCount } : t
      ),
    })),
}))
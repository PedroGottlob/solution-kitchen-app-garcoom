import { bffOperacional } from './api'

export interface TableStatus {
  tableId: string
  status: 'occupied' | 'ready' | 'free'
  orderCount: number
}

export const tableService = {
  async getTableStatus(): Promise<TableStatus[]> {
    const { data } = await bffOperacional.get<TableStatus[]>('/api/tables/status')
    return data
  },
}
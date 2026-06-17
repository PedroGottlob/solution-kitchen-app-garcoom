import { bffOperacional } from './api'

export interface TableStatus {
  id: string
  number: number
  name?: string
  status: 'Free' | 'Occupied' | 'Closed'
  capacity: number
  createdAt: string
  occupiedAt?: string
}

export const tableService = {
  async getTables(): Promise<TableStatus[]> {
    const { data } = await bffOperacional.get<TableStatus[]>('/api/tables')
    return data
  },

  async closeTable(tableId: string): Promise<void> {
    await bffOperacional.post(`/api/tables/${tableId}/close`)
  },
}
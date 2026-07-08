import { bffOperacional } from './api'

export interface TableStatus {
  id: string
  number: number
  name?: string
  status: 'Free' | 'Occupied' | 'Closed' | 'Inactive'
  capacity: number
  createdAt: string
  occupiedAt?: string
}

export interface CreateTablePayload {
  number: number
  name?: string
  capacity: number
}

export const tableService = {
  async getTables(includeInactive = false): Promise<TableStatus[]> {
    const { data } = await bffOperacional.get<TableStatus[]>(`/api/tables?includeInactive=${includeInactive}`)
    return data
  },

  async createTable(payload: CreateTablePayload): Promise<TableStatus> {
    const { data } = await bffOperacional.post<TableStatus>('/api/tables', payload)
    return data
  },

  async updateTable(tableId: string, payload: CreateTablePayload): Promise<TableStatus> {
    const { data } = await bffOperacional.put<TableStatus>(`/api/tables/${tableId}`, payload)
    return data
  },

  async deactivateTable(tableId: string): Promise<void> {
    await bffOperacional.patch(`/api/tables/${tableId}/deactivate`)
  },

  async closeTable(tableId: string): Promise<void> {
    await bffOperacional.post(`/api/tables/${tableId}/close`)
  },
}
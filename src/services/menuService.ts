import { bffOperacional } from './api'

export interface MenuItem {
  id: string
  categoryId: string
  categoryName: string
  name: string
  description?: string
  price: number
  cost: number
  margin: number
  status: string
}

export interface CreateMenuItemPayload {
  categoryId: string
  name: string
  description?: string
  price: number
  cost: number
}

export const menuService = {
  async getMenuItems(includeInactive = false): Promise<MenuItem[]> {
    const { data } = await bffOperacional.get<MenuItem[]>(`/api/menu?includeInactive=${includeInactive}`)
    return data
  },
  async createMenuItem(payload: CreateMenuItemPayload): Promise<MenuItem> {
    const { data } = await bffOperacional.post<MenuItem>('/api/menu', payload)
    return data
  },
  async updateMenuItem(itemId: string, payload: CreateMenuItemPayload): Promise<MenuItem> {
    const { data } = await bffOperacional.put<MenuItem>(`/api/menu/${itemId}`, payload)
    return data
  },
  async deactivateMenuItem(itemId: string): Promise<void> {
    await bffOperacional.patch(`/api/menu/${itemId}/deactivate`)
  },
  async activateMenuItem(itemId: string): Promise<void> {
    await bffOperacional.patch(`/api/menu/${itemId}/activate`)
  },
}
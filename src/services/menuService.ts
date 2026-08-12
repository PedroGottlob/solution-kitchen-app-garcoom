import { bffOperacional, getTenantId } from './api'

export interface MenuItemOption {
  id: string
  name: string
  additionalCost: number
  isDefault: boolean
}

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
  hasImage: boolean
  options: MenuItemOption[]
}

const BFF_OPERACIONAL_URL = import.meta.env.VITE_BFF_OPERACIONAL_URL || 'http://localhost:5159'

// <img src> não consegue mandar header customizado, então o tenant vai por
// query string (o backend aceita os dois -- ver MenuController do bff).
export function getMenuItemImageUrl(itemId: string): string {
  return `${BFF_OPERACIONAL_URL}/api/menu/${itemId}/image?tenantId=${getTenantId()}`
}

export interface CreateMenuItemPayload {
  categoryId: string
  name: string
  description?: string
  price: number
  cost: number
}

export interface CreateMenuItemOptionPayload {
  name: string
  additionalCost: number
  isDefault: boolean
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
  async addOption(itemId: string, payload: CreateMenuItemOptionPayload): Promise<MenuItemOption> {
    const { data } = await bffOperacional.post<MenuItemOption>(`/api/menu/${itemId}/options`, payload)
    return data
  },
  async removeOption(itemId: string, optionId: string): Promise<void> {
    await bffOperacional.delete(`/api/menu/${itemId}/options/${optionId}`)
  },
  async uploadImage(itemId: string, file: File): Promise<MenuItem> {
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await bffOperacional.post<MenuItem>(`/api/menu/${itemId}/image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },
  async removeImage(itemId: string): Promise<void> {
    await bffOperacional.delete(`/api/menu/${itemId}/image`)
  },
}
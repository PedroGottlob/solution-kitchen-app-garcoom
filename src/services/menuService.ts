import { bffOperacional } from './api'

export interface MenuItem {
  id: string
  categoryId: string
  categoryName: string
  name: string
  description?: string
  price: number
  status: string
}

export const menuService = {
  async getMenuItems(): Promise<MenuItem[]> {
    const { data } = await bffOperacional.get<MenuItem[]>('/api/menu')
    return data
  },
}
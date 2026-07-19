import { bffOperacional } from './api'

export interface TenantInfo {
  id: string
  name: string
  slug: string
  plan: string
}

export const tenantService = {
  async getCurrent(): Promise<TenantInfo> {
    const { data } = await bffOperacional.get<TenantInfo>('/api/tenants/current')
    return data
  },
}
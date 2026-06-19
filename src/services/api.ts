import axios from 'axios'

const DEFAULT_TENANT_ID = '00000000-0000-0000-0000-000000000001'

export const bffOperacional = axios.create({
  baseURL: import.meta.env.VITE_BFF_OPERACIONAL_URL || 'http://localhost:5159',
  headers: {
    'X-Tenant-Id': DEFAULT_TENANT_ID,
  },
})

export const bffCozinha = axios.create({
  baseURL: import.meta.env.VITE_BFF_COZINHA_URL || 'http://localhost:5164',
  headers: {
    'X-Tenant-Id': DEFAULT_TENANT_ID,
  },
})

export function setTenantId(tenantId: string) {
  bffOperacional.defaults.headers['X-Tenant-Id'] = tenantId
  bffCozinha.defaults.headers['X-Tenant-Id'] = tenantId
}
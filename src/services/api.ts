import axios from 'axios'

const DEV_FALLBACK_TENANT_ID = '00000000-0000-0000-0000-000000000001'

export const bffOperacional = axios.create({
  baseURL: import.meta.env.VITE_BFF_OPERACIONAL_URL || 'http://localhost:5159',
  headers: import.meta.env.DEV ? { 'X-Tenant-Id': DEV_FALLBACK_TENANT_ID } : {},
})

export const bffCozinha = axios.create({
  baseURL: import.meta.env.VITE_BFF_COZINHA_URL || 'http://localhost:5164',
  headers: import.meta.env.DEV ? { 'X-Tenant-Id': DEV_FALLBACK_TENANT_ID } : {},
})

export function setTenantId(tenantId: string) {
  bffOperacional.defaults.headers['X-Tenant-Id'] = tenantId
  bffCozinha.defaults.headers['X-Tenant-Id'] = tenantId
}
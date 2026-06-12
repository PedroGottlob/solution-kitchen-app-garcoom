import axios from 'axios'

const TENANT_ID = import.meta.env.VITE_TENANT_ID || '00000000-0000-0000-0000-000000000001'

export const bffOperacional = axios.create({
  baseURL: import.meta.env.VITE_BFF_OPERACIONAL_URL || 'http://localhost:5159',
  headers: {
    'X-Tenant-Id': TENANT_ID,
  },
})

export const bffCozinha = axios.create({
  baseURL: import.meta.env.VITE_BFF_COZINHA_URL || 'http://localhost:5164',
  headers: {
    'X-Tenant-Id': TENANT_ID,
  },
})

export const TENANT_ID_VALUE = TENANT_ID
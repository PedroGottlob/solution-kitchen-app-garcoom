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

export function getTenantId(): string {
  return (bffOperacional.defaults.headers['X-Tenant-Id'] as string) || DEV_FALLBACK_TENANT_ID
}

// O backend agora exige um token de verdade nos endpoints de staff (ver
// revisão de segurança) — antes o app fazia login mas nunca mandava o
// token pras BFFs. Esse getter é preenchido pelo App.tsx assim que o
// Auth0 termina de autenticar, e o interceptor busca um token fresco
// (o SDK do Auth0 cacheia/renova sozinho) em toda requisição.
let getAccessToken: (() => Promise<string>) | null = null

export function setAuthTokenGetter(getter: () => Promise<string>) {
  getAccessToken = getter
}

async function attachAuthToken(config: import('axios').InternalAxiosRequestConfig) {
  if (getAccessToken) {
    try {
      const token = await getAccessToken()
      config.headers.set('Authorization', `Bearer ${token}`)
    } catch {
      // Sem token disponível — a requisição segue sem Authorization e o
      // backend rejeita com 401 se a rota exigir login.
    }
  }
  return config
}

bffOperacional.interceptors.request.use(attachAuthToken)
bffCozinha.interceptors.request.use(attachAuthToken)
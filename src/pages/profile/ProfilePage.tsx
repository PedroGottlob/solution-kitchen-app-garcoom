import { useEffect, useState } from 'react'
import { useAuth0 } from '@auth0/auth0-react'
import { tenantService, type TenantInfo } from '../../services/tenantService'

const NAMESPACE = 'https://solution-kitchen.com'

const ROLE_LABELS: Record<string, string> = {
  gerente: 'Gerente',
  garcom: 'Garçom',
  chef: 'Chef',
}

const PLAN_LABELS: Record<string, string> = {
  basic: 'Básico',
  premium: 'Premium',
}

function formatRoles(roles: string[]): string {
  if (roles.length === 0) return '—'
  const labels = roles.map(r => ROLE_LABELS[r] ?? r)
  if (labels.length === 1) return labels[0]
  if (labels.length === 2) return labels.join(' · ')
  return `${labels.slice(0, -1).join(', ')} e ${labels[labels.length - 1]}`
}

export function ProfilePage() {
  const { user, logout } = useAuth0()

  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [tenantLoading, setTenantLoading] = useState(true)

  const roles: string[] = user?.[`${NAMESPACE}/roles`] ?? []
  const roleLabel = formatRoles(roles)

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??'

  useEffect(() => {
    tenantService.getCurrent()
      .then(setTenant)
      .catch(console.error)
      .finally(() => setTenantLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-20">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <h1 className="text-white text-xl font-medium">Perfil</h1>
      </div>

      {/* Avatar e nome */}
      <div className="flex flex-col items-center py-8 gap-3">
        {user?.picture ? (
          <img
            src={user.picture}
            alt={user.name}
            className="w-20 h-20 rounded-full border-2 border-violet-700"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-violet-950 border-2 border-violet-700 flex items-center justify-center">
            <span className="text-violet-300 text-2xl font-medium">{initials}</span>
          </div>
        )}
        <div className="text-center">
          <p className="text-white text-lg font-medium">{user?.name ?? 'Usuário'}</p>
          <p className="text-zinc-500 text-sm">{user?.email}</p>
        </div>
      </div>

      {/* Informações */}
      <div className="px-5 mb-6">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">
          Informações
        </p>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">

          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
            <i className="ti ti-building-store text-zinc-400 text-lg" />
            <div className="flex-1">
              <p className="text-zinc-400 text-xs">Estabelecimento</p>
              {tenantLoading ? (
                <p className="text-zinc-500 text-sm italic">Carregando...</p>
              ) : tenant ? (
                <div>
                  <p className="text-white text-sm">{tenant.name}</p>
                  <p className="text-zinc-500 text-xs">Plano {PLAN_LABELS[tenant.plan] ?? tenant.plan}</p>
                </div>
              ) : (
                <p className="text-zinc-500 text-sm italic">Não disponível</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-3">
            <i className="ti ti-id-badge text-zinc-400 text-lg" />
            <div>
              <p className="text-zinc-400 text-xs">Função</p>
              <p className="text-white text-sm">{roleLabel}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout */}
      <div className="px-5">
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="w-full py-3.5 rounded-xl bg-red-950 border border-red-900 text-red-400 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-red-900 transition-colors"
        >
          <i className="ti ti-logout text-lg" />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
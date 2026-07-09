import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { BottomNav } from './components/common/BottomNav'
import { TablesPage } from './pages/tables/TablesPage'
import { OrdersPage } from './pages/orders/OrdersPage'
import { AccountPage } from './pages/account/AccountPage'
import { TableDetailPage } from './pages/tables/TableDetailPage'
import { NewOrderPage } from './pages/orders/NewOrderPage'
import { CloseAccountPage } from './pages/account/CloseAccountPage'
import { ProfilePage } from './pages/profile/ProfilePage'
import { DashboardPage } from './pages/dashboard/DashboardPage'
import { setTenantId } from './services/api'
import { signalRService } from './services/signalRService'
import { MenuManagementPage } from './pages/menu/MenuManagementPage'
import { TableManagementPage } from './pages/tables/TableManagementPage'

const NAMESPACE = 'https://solution-kitchen.com'
const DEV_FALLBACK_TENANT_ID = '00000000-0000-0000-0000-000000000001'

function App() {
  const { isLoading, isAuthenticated, loginWithRedirect, user } = useAuth0()

  const roles: string[] = user?.[`${NAMESPACE}/roles`] ?? []
  const rawTenantId: string | undefined = user?.[`${NAMESPACE}/tenant_id`]
  const tenantId: string | undefined = rawTenantId ?? (import.meta.env.DEV ? DEV_FALLBACK_TENANT_ID : undefined)
  const isGerente = roles.includes('gerente')

  useEffect(() => {
    if (!isAuthenticated) return
    if (!user) return
    if (!roles.includes('garcom') && !roles.includes('gerente')) return
    if (!tenantId) return

    setTenantId(tenantId)
    signalRService.setTenantId(tenantId)
    signalRService.connect().catch(console.error)
  }, [isAuthenticated, user, tenantId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Carregando...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-6 px-8">
        <div className="text-center">
          <h1 className="text-white text-2xl font-medium mb-2">Solution Kitchen</h1>
          <p className="text-zinc-500 text-sm">Faça login para continuar</p>
        </div>
        <button
          onClick={() => loginWithRedirect()}
          className="w-full max-w-xs py-3.5 rounded-xl bg-violet-600 text-white font-medium text-sm cursor-pointer hover:bg-violet-500 transition-colors"
        >
          Entrar
        </button>
      </div>
    )
  }

  if (!roles.includes('garcom') && !roles.includes('gerente')) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-8">
        <div className="text-center">
          <p className="text-white text-lg font-medium mb-2">Acesso negado</p>
          <p className="text-zinc-500 text-sm">Você não tem permissão para acessar este app.</p>
        </div>
      </div>
    )
  }

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-8">
        <div className="text-center">
          <p className="text-white text-lg font-medium mb-2">Conta sem restaurante vinculado</p>
          <p className="text-zinc-500 text-sm">Sua conta não está associada a nenhum restaurante. Entre em contato com o suporte.</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950">
        <Routes>
          <Route path="/" element={<TablesPage isGerente={isGerente} />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route
            path="/tables/manage"
            element={isGerente ? <TableManagementPage /> : <Navigate to="/" replace />}
          />
          <Route path="/tables/:tableId" element={<TableDetailPage />} />
          <Route path="/tables/:tableId/new-order" element={<NewOrderPage />} />
          <Route path="/tables/:tableId/account" element={<CloseAccountPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/dashboard"
            element={isGerente ? <DashboardPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/menu"
            element={isGerente ? <MenuManagementPage /> : <Navigate to="/" replace />}
          />
        </Routes>
        <BottomNav isGerente={isGerente} />
      </div>
    </BrowserRouter>
  )
}

export default App
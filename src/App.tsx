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

function App() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0()

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

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950">
        <Routes>
          <Route path="/" element={<TablesPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/tables/:tableId" element={<TableDetailPage />} />
          <Route path="/tables/:tableId/new-order" element={<NewOrderPage />} />
          <Route path="/tables/:tableId/account" element={<CloseAccountPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}

export default App
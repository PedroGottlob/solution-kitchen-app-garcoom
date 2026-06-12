import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { BottomNav } from './components/common/BottomNav'
import { TablesPage } from './pages/tables/TablesPage'
import { OrdersPage } from './pages/orders/OrdersPage'
import { AccountPage } from './pages/account/AccountPage'
import { TableDetailPage } from './pages/tables/TableDetailPage'
import { NewOrderPage } from './pages/orders/NewOrderPage'
import { CloseAccountPage } from './pages/account/CloseAccountPage'
import { ProfilePage } from './pages/profile/ProfilePage'


function App() {
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
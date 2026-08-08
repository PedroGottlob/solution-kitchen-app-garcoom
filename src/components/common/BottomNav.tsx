import { useLocation, useNavigate } from 'react-router-dom'

const baseTabs = [
  { path: '/', icon: 'ti-layout-grid', label: 'Mesas' },
  { path: '/orders', icon: 'ti-clipboard-list', label: 'Pedidos' },
  { path: '/account', icon: 'ti-receipt', label: 'Conta' },
  { path: '/profile', icon: 'ti-user', label: 'Perfil' },
]

const gerenteTabs = [
  { path: '/', icon: 'ti-layout-grid', label: 'Mesas' },
  { path: '/orders', icon: 'ti-clipboard-list', label: 'Pedidos' },
  { path: '/menu', icon: 'ti-book', label: 'Cardápio' },
  { path: '/dashboard', icon: 'ti-chart-bar', label: 'Dashboard' },
  { path: '/profile', icon: 'ti-user', label: 'Perfil' },
]

export function BottomNav({ isGerente }: { isGerente: boolean }) {
  const location = useLocation()
  const navigate = useNavigate()
  const tabs = isGerente ? gerenteTabs : baseTabs

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-100 border-t border-zinc-200 flex z-50">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex-1 flex flex-col items-center gap-1 py-3 cursor-pointer"
          >
            <i className={`ti ${tab.icon} text-2xl ${active ? 'text-accent-600' : 'text-zinc-500'}`} />
            <span className={`text-xs ${active ? 'text-accent-600' : 'text-zinc-500'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}

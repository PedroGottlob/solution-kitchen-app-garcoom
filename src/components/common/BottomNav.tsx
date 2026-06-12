import { useLocation, useNavigate } from 'react-router-dom'

const tabs = [
  { path: '/', icon: 'ti-layout-grid', label: 'Mesas' },
  { path: '/orders', icon: 'ti-clipboard-list', label: 'Pedidos' },
  { path: '/account', icon: 'ti-receipt', label: 'Conta' },
  { path: '/profile', icon: 'ti-user', label: 'Perfil' },
]

export function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 flex z-50">
      {tabs.map((tab) => {
        const active = location.pathname === tab.path
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex-1 flex flex-col items-center gap-1 py-3 cursor-pointer"
          >
            <i className={`ti ${tab.icon} text-2xl ${active ? 'text-violet-400' : 'text-zinc-500'}`} />
            <span className={`text-xs ${active ? 'text-violet-400' : 'text-zinc-500'}`}>
              {tab.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}
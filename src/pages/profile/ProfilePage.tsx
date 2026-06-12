import { useNavigate } from 'react-router-dom'

export function ProfilePage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-20">

      {/* Header */}
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <h1 className="text-white text-xl font-medium">Perfil</h1>
      </div>

      {/* Avatar e nome */}
      <div className="flex flex-col items-center py-8 gap-3">
        <div className="w-20 h-20 rounded-full bg-violet-950 border-2 border-violet-700 flex items-center justify-center">
          <span className="text-violet-300 text-2xl font-medium">PG</span>
        </div>
        <div className="text-center">
          <p className="text-white text-lg font-medium">Pedro Gottlob</p>
          <p className="text-zinc-500 text-sm">Garçom · Turno da tarde</p>
        </div>
      </div>

      {/* Estatísticas do dia */}
      <div className="px-5 mb-6">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">
          Hoje
        </p>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-3 text-center">
            <div className="text-violet-400 text-xl font-medium">12</div>
            <div className="text-zinc-500 text-xs">Pedidos</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-3 text-center">
            <div className="text-emerald-400 text-xl font-medium">8</div>
            <div className="text-zinc-500 text-xs">Mesas</div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-3 text-center">
            <div className="text-amber-400 text-xl font-medium">R$ 847</div>
            <div className="text-zinc-500 text-xs">Faturamento</div>
          </div>
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
            <div>
              <p className="text-zinc-400 text-xs">Estabelecimento</p>
              <p className="text-white text-sm">Restaurante Dev</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
            <i className="ti ti-clock text-zinc-400 text-lg" />
            <div>
              <p className="text-zinc-400 text-xs">Turno</p>
              <p className="text-white text-sm">14:00 — 22:00</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3">
            <i className="ti ti-id-badge text-zinc-400 text-lg" />
            <div>
              <p className="text-zinc-400 text-xs">Função</p>
              <p className="text-white text-sm">Garçom</p>
            </div>
          </div>
        </div>
      </div>

      {/* Configurações */}
      <div className="px-5 mb-6">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">
          Configurações
        </p>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <button className="w-full flex items-center gap-3 px-4 py-3 border-b border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors">
            <i className="ti ti-bell text-zinc-400 text-lg" />
            <span className="text-white text-sm flex-1 text-left">Notificações</span>
            <i className="ti ti-chevron-right text-zinc-600 text-sm" />
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-zinc-800 transition-colors">
            <i className="ti ti-moon text-zinc-400 text-lg" />
            <span className="text-white text-sm flex-1 text-left">Tema escuro</span>
            <i className="ti ti-chevron-right text-zinc-600 text-sm" />
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="px-5">
        <button className="w-full py-3.5 rounded-xl bg-red-950 border border-red-900 text-red-400 font-medium text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-red-900 transition-colors">
          <i className="ti ti-logout text-lg" />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
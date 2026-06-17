import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTableStore } from '../../store/tableStore'
import { useNotificationStore } from '../../store/notificationStore'
import { TableCard } from '../../components/waiter/TableCard'
import { NotificationDropdown } from '../../components/common/NotificationDropdown'
import { tableService } from '../../services/tableService'
import type { Table } from '../../types'

export function TablesPage() {
  const { tables, updateTableStatus, selectTable } = useTableStore()
  const navigate = useNavigate()
  const unreadCount = useNotificationStore(state => state.unreadCount)
  const unread = unreadCount()
  const [showNotifications, setShowNotifications] = useState(false)

  useEffect(() => {
    tableService.getTables()
      .then(tableList => {
        tables.forEach(t => updateTableStatus(t.id, 'free', 0))
        tableList.forEach(t => {
          const status = t.status === 'Occupied' ? 'occupied'
            : t.status === 'Closed' ? 'free'
            : 'free'
          updateTableStatus(t.id, status as Table['status'])
        })
      })
      .catch(console.error)
  }, [])

  const free = tables.filter(t => t.status === 'free').length
  const occupied = tables.filter(t => t.status === 'occupied').length
  const ready = tables.filter(t => t.status === 'ready').length

  function handleTableClick(table: Table) {
    selectTable(table)
    navigate(`/tables/${table.id}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col pb-20">
      <div className="bg-zinc-900 border-b border-zinc-800 px-5 py-4">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-white text-xl font-medium">Salão principal</h1>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center relative"
            >
              <i className="ti ti-bell text-zinc-400 text-lg" />
              {unread > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center">
                  {unread}
                </span>
              )}
            </button>
            {showNotifications && (
              <NotificationDropdown onClose={() => setShowNotifications(false)} />
            )}
          </div>
        </div>
        <p className="text-zinc-500 text-sm">{tables.length} mesas · {occupied} ocupadas</p>
      </div>

      <div className="px-5 py-4 flex gap-3">
        <div className="flex-1 bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
          <div className="text-emerald-400 text-lg font-medium">{free}</div>
          <div className="text-zinc-500 text-xs">Livres</div>
        </div>
        <div className="flex-1 bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
          <div className="text-violet-400 text-lg font-medium">{occupied}</div>
          <div className="text-zinc-500 text-xs">Ocupadas</div>
        </div>
        <div className="flex-1 bg-zinc-900 rounded-xl p-3 text-center border border-zinc-800">
          <div className="text-amber-400 text-lg font-medium">{ready}</div>
          <div className="text-zinc-500 text-xs">Prontas</div>
        </div>
      </div>

      <div className="px-5">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wider mb-3">
          Visão geral
        </p>
        <div className="grid grid-cols-3 gap-3">
          {tables.map(table => (
            <TableCard
              key={table.id}
              table={table}
              onClick={handleTableClick}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
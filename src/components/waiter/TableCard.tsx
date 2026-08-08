import type { Table } from '../../types'

interface TableCardProps {
  table: Table
  onClick: (table: Table) => void
}

const statusConfig = {
  free: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
    label: 'Livre',
    labelColor: 'text-emerald-600',
  },
  occupied: {
    bg: 'bg-accent-50',
    border: 'border-accent-200',
    text: 'text-accent-700',
    label: 'Ocupada',
    labelColor: 'text-accent-600',
  },
  ready: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
    label: 'Pronto!',
    labelColor: 'text-amber-600',
  },
}

export function TableCard({ table, onClick }: TableCardProps) {
  const config = statusConfig[table.status]
  return (
    <button
      onClick={() => onClick(table)}
      className={`${config.bg} border ${config.border} rounded-xl p-4 flex flex-col items-center gap-1 cursor-pointer active:scale-95 transition-transform`}
    >
      <span className={`text-xl font-medium ${config.text}`}>
        {String(table.number).padStart(2, '0')}
      </span>
      {table.name && (
        <span className="text-zinc-500 text-[10px] truncate max-w-full">{table.name}</span>
      )}
      <span className={`text-xs ${config.labelColor}`}>
        {table.status === 'free' ? 'Livre' : `${table.orderCount} pedido${table.orderCount !== 1 ? 's' : ''}`}
      </span>
    </button>
  )
}
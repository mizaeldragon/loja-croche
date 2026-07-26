import { useMemo, useState } from 'react'
import { Search, Trash2, ClipboardList, Phone, Mail } from 'lucide-react'
import usePageHeader from '../../lib/usePageHeader'
import { useCatalogStore } from '../../store/useCatalogStore'
import { formatCurrency, formatDate } from '../../lib/format'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { notifySuccess } from '../../store/useToastStore'

const STATUS_OPTIONS = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

export default function Orders() {
  usePageHeader('Pedidos & Orçamentos', 'Acompanhe solicitações recebidas pela landing page')

  const orders = useCatalogStore((s) => s.orders)
  const updateOrderStatus = useCatalogStore((s) => s.updateOrderStatus)
  const deleteOrder = useCatalogStore((s) => s.deleteOrder)

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toDelete, setToDelete] = useState(null)

  const filtered = useMemo(() => {
    let list = [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((o) => o.customerName.toLowerCase().includes(q) || o.items.toLowerCase().includes(q))
    }
    if (statusFilter) list = list.filter((o) => o.status === statusFilter)
    return list
  }, [orders, query, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-espresso-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar por cliente ou item..." className="input-field pl-11" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={ClipboardList} title="Nenhum pedido encontrado" description="Assim que clientes solicitarem orçamentos pelo site, eles aparecerão aqui." />
      ) : (
        <div className="space-y-4">
          {filtered.map((o) => (
            <div key={o.id} className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-display text-base text-espresso-800">{o.customerName}</h3>
                  <span className="chip">{o.type === 'orcamento' ? 'Orçamento' : 'Pedido'}</span>
                  <span className="text-xs text-espresso-400">{formatDate(o.createdAt)}</span>
                </div>
                <p className="mt-1.5 text-sm text-espresso-600">{o.items}</p>
                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-espresso-400">
                  {o.contact && <span className="flex items-center gap-1.5"><Phone size={12} /> {o.contact}</span>}
                  {o.email && <span className="flex items-center gap-1.5"><Mail size={12} /> {o.email}</span>}
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-3">
                {o.total != null && <span className="font-display text-lg text-espresso-800">{formatCurrency(o.total)}</span>}
                <select
                  value={o.status}
                  onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                  className="input-field w-auto text-xs"
                >
                  {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <button
                  onClick={() => setToDelete(o)}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-espresso-400 hover:bg-terracotta-600/10 hover:text-terracotta-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir registro?"
        description={`Deseja remover o registro de "${toDelete?.customerName}"?`}
        confirmLabel="Excluir"
        onConfirm={() => { deleteOrder(toDelete.id); notifySuccess('Registro excluído.') }}
      />
    </div>
  )
}

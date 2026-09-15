import { useMemo, useState } from 'react'
import { ClipboardList, Mail, MapPin, Phone, Search, Trash2, Truck } from 'lucide-react'
import usePageHeader from '../../lib/usePageHeader'
import { useCatalogStore } from '../../store/useCatalogStore'
import { formatCurrency, formatDate } from '../../lib/format'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { notifySuccess } from '../../store/useToastStore'

const ORDER_STATUS = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_andamento', label: 'Em produção' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'concluido', label: 'Concluído' },
  { value: 'cancelado', label: 'Cancelado' },
]

const QUOTE_STATUS = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'respondido', label: 'Respondido' },
  { value: 'fechado', label: 'Fechado' },
]

const formatCep = (zip = '') => zip.replace(/^(\d{5})(\d{3})$/, '$1-$2')

function OrderCard({ order, onStatusChange, onTrackingSave }) {
  const [tracking, setTracking] = useState(order.trackingCode ?? '')
  const a = order.address

  return (
    <div className="card-surface space-y-4 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h3 className="font-display text-base text-espresso-800">
              Pedido #{order.number}
            </h3>
            <StatusBadge status={order.paymentStatus} />
            <span className="text-xs text-espresso-400">{formatDate(order.createdAt)}</span>
          </div>
          <p className="mt-1 text-sm text-espresso-600">{order.customer?.name}</p>
          <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-espresso-400">
            {order.customer?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={12} /> {order.customer.phone}
              </span>
            )}
            {order.customer?.email && (
              <span className="flex items-center gap-1.5">
                <Mail size={12} /> {order.customer.email}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <p className="font-display text-xl text-espresso-800">{formatCurrency(order.total)}</p>
          <p className="text-xs text-espresso-400">
            {formatCurrency(order.subtotal)} + {formatCurrency(order.shippingCost)} de frete
          </p>
        </div>
      </div>

      <ul className="space-y-1 border-t border-espresso-700/8 pt-3 text-sm text-espresso-600">
        {order.items?.map((item) => (
          <li key={item.id} className="flex justify-between gap-3">
            <span>
              {item.quantity}× {item.productName}
              {(item.color || item.size) && (
                <span className="text-espresso-400">
                  {' '}
                  ({[item.color, item.size].filter(Boolean).join(', ')})
                </span>
              )}
            </span>
            <span className="shrink-0">{formatCurrency(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>

      {a && (
        <p className="flex items-start gap-1.5 border-t border-espresso-700/8 pt-3 text-xs text-espresso-500">
          <MapPin size={13} className="mt-0.5 shrink-0" />
          <span>
            {a.street}, {a.number}
            {a.complement ? ` — ${a.complement}` : ''} · {a.district} · {a.city}/{a.state} ·{' '}
            {formatCep(a.zip)}
          </span>
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-espresso-700/8 pt-3">
        {order.shippingCarrier && (
          <span className="flex items-center gap-1.5 text-xs text-espresso-500">
            <Truck size={13} /> {order.shippingCarrier}
            {order.shippingDays ? ` · ${order.shippingDays} dias` : ''}
          </span>
        )}

        <select
          value={order.status}
          onChange={(e) => onStatusChange(order.id, e.target.value)}
          className="input-field w-auto text-xs"
          aria-label={`Status do pedido ${order.number}`}
        >
          {ORDER_STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            placeholder="Código de rastreio"
            className="input-field w-44 text-xs"
            aria-label={`Rastreio do pedido ${order.number}`}
          />
          <button
            type="button"
            onClick={() => onTrackingSave(order.id, tracking)}
            disabled={tracking === (order.trackingCode ?? '')}
            className="btn-secondary btn-sm disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Orders() {
  usePageHeader('Pedidos & Orçamentos', 'Acompanhe as vendas e as solicitações recebidas pelo site')

  const orders = useCatalogStore((s) => s.orders)
  const quotes = useCatalogStore((s) => s.quotes)
  const updateOrderStatus = useCatalogStore((s) => s.updateOrderStatus)
  const updateOrderTracking = useCatalogStore((s) => s.updateOrderTracking)
  const updateQuoteStatus = useCatalogStore((s) => s.updateQuoteStatus)
  const deleteQuote = useCatalogStore((s) => s.deleteQuote)

  const [tab, setTab] = useState('pedidos')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toDelete, setToDelete] = useState(null)

  const filteredOrders = useMemo(() => {
    let list = orders
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (o) =>
          o.customer?.name?.toLowerCase().includes(q) ||
          o.customer?.email?.toLowerCase().includes(q) ||
          String(o.number).includes(q) ||
          o.items?.some((i) => i.productName.toLowerCase().includes(q))
      )
    }
    if (statusFilter) list = list.filter((o) => o.status === statusFilter)
    return list
  }, [orders, query, statusFilter])

  const filteredQuotes = useMemo(() => {
    let list = quotes
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (x) => x.name.toLowerCase().includes(q) || x.message.toLowerCase().includes(q)
      )
    }
    if (statusFilter) list = list.filter((x) => x.status === statusFilter)
    return list
  }, [quotes, query, statusFilter])

  const statusOptions = tab === 'pedidos' ? ORDER_STATUS : QUOTE_STATUS

  const handleTracking = async (id, code) => {
    await updateOrderTracking(id, code || null)
    notifySuccess('Rastreio atualizado.')
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-2xl bg-espresso-700/5 p-1">
        {[
          { id: 'pedidos', label: `Pedidos (${orders.length})` },
          { id: 'orcamentos', label: `Orçamentos (${quotes.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTab(t.id)
              setStatusFilter('')
            }}
            className={`flex-1 rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-white text-espresso-800 shadow-soft' : 'text-espresso-500'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-espresso-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por cliente, item ou número..."
            className="input-field pl-11"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Todos os status</option>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {tab === 'pedidos' &&
        (filteredOrders.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhum pedido encontrado"
            description="Assim que uma compra for finalizada no site, ela aparece aqui."
          />
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((o) => (
              <OrderCard
                key={o.id}
                order={o}
                onStatusChange={updateOrderStatus}
                onTrackingSave={handleTracking}
              />
            ))}
          </div>
        ))}

      {tab === 'orcamentos' &&
        (filteredQuotes.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="Nenhum orçamento encontrado"
            description="Solicitações enviadas pelo formulário da landing page aparecem aqui."
          />
        ) : (
          <div className="space-y-4">
            {filteredQuotes.map((q) => (
              <div
                key={q.id}
                className="card-surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="font-display text-base text-espresso-800">{q.name}</h3>
                    <StatusBadge status={q.status} />
                    <span className="text-xs text-espresso-400">{formatDate(q.createdAt)}</span>
                  </div>
                  <p className="mt-1.5 text-sm text-espresso-600">
                    {q.message || 'Sem detalhes informados'}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-espresso-400">
                    {q.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={12} /> {q.phone}
                      </span>
                    )}
                    {q.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={12} /> {q.email}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <select
                    value={q.status}
                    onChange={(e) => updateQuoteStatus(q.id, e.target.value)}
                    className="input-field w-auto text-xs"
                    aria-label={`Status do orçamento de ${q.name}`}
                  >
                    {QUOTE_STATUS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => setToDelete(q)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-espresso-400 hover:bg-terracotta-600/10 hover:text-terracotta-600"
                    aria-label={`Excluir orçamento de ${q.name}`}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir orçamento?"
        description={`Deseja remover a solicitação de "${toDelete?.name}"?`}
        confirmLabel="Excluir"
        onConfirm={async () => {
          await deleteQuote(toDelete.id)
          notifySuccess('Orçamento excluído.')
          setToDelete(null)
        }}
      />
    </div>
  )
}

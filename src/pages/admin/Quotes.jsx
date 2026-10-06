import { useMemo, useState } from 'react'
import { ClipboardList, Mail, Phone, Search, Trash2 } from 'lucide-react'
import usePageHeader from '../../lib/usePageHeader'
import { useCatalogStore } from '../../store/useCatalogStore'
import { formatDate } from '../../lib/format'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { notifySuccess } from '../../store/useToastStore'

const QUOTE_STATUS = [
  { value: 'novo', label: 'Novo' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'respondido', label: 'Respondido' },
  { value: 'fechado', label: 'Fechado' },
]

export default function Quotes() {
  usePageHeader('Orçamentos', 'Acompanhe as solicitações recebidas pelo site')

  const quotes = useCatalogStore((s) => s.quotes)
  const updateQuoteStatus = useCatalogStore((s) => s.updateQuoteStatus)
  const deleteQuote = useCatalogStore((s) => s.deleteQuote)

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [toDelete, setToDelete] = useState(null)

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-espresso-400"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou mensagem..."
            className="input-field pl-11"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto"
        >
          <option value="">Todos os status</option>
          {QUOTE_STATUS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {filteredQuotes.length === 0 ? (
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
      )}

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

import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Star,
  Package,
  ExternalLink,
  ArrowUpDown,
} from 'lucide-react'
import usePageHeader from '../../lib/usePageHeader'
import { useCatalogStore } from '../../store/useCatalogStore'
import { formatCurrency, formatDate } from '../../lib/format'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Pagination from '../../components/ui/Pagination'
import { TableRowSkeleton } from '../../components/ui/Skeleton'
import { notifySuccess } from '../../store/useToastStore'

const PAGE_SIZE = 8

export default function Products() {
  usePageHeader('Produtos', 'Crie, edite e organize o catálogo do ateliê')

  const products = useCatalogStore((s) => s.products)
  const categories = useCatalogStore((s) => s.categories)
  const deleteProduct = useCatalogStore((s) => s.deleteProduct)
  const duplicateProduct = useCatalogStore((s) => s.duplicateProduct)
  const toggleProductStatus = useCatalogStore((s) => s.toggleProductStatus)
  const toggleProductFlag = useCatalogStore((s) => s.toggleProductFlag)

  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sortBy, setSortBy] = useState('order')
  const [page, setPage] = useState(1)
  const [toDelete, setToDelete] = useState(null)

  const filtered = useMemo(() => {
    let list = [...products]
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q))
    }
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter)
    if (statusFilter) list = list.filter((p) => p.status === statusFilter)

    const sorters = {
      order: (a, b) => a.order - b.order,
      name: (a, b) => a.name.localeCompare(b.name),
      'price-asc': (a, b) => a.price - b.price,
      'price-desc': (a, b) => b.price - a.price,
      recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      stock: (a, b) => a.stock - b.stock,
    }
    list.sort(sorters[sortBy] || sorters.order)
    return list
  }, [products, query, categoryFilter, statusFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const categoryName = (slug) => categories.find((c) => c.slug === slug)?.name || slug

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-espresso-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            placeholder="Buscar produto por nome..."
            className="input-field pl-11"
          />
        </div>
        <Link to="/admin/produtos/novo" className="btn-primary btn-md">
          <Plus size={16} /> Novo produto
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="input-field w-auto"
        >
          <option value="">Todas as categorias</option>
          {categories.map((c) => (
            <option key={c.id} value={c.slug}>{c.name}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="input-field w-auto"
        >
          <option value="">Todos os status</option>
          <option value="published">Publicado</option>
          <option value="draft">Rascunho</option>
        </select>
        <div className="relative">
          <ArrowUpDown size={14} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-espresso-400" />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field w-auto pl-9">
            <option value="order">Ordem de exibição</option>
            <option value="recent">Mais recentes</option>
            <option value="name">Nome (A-Z)</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="stock">Estoque</option>
          </select>
        </div>
      </div>

      <div className="card-surface overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Nenhum produto encontrado"
            description="Ajuste os filtros ou cadastre um novo produto para começar a vender."
            action={
              <Link to="/admin/produtos/novo" className="btn-primary btn-sm">
                <Plus size={14} /> Cadastrar produto
              </Link>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full min-w-[820px] text-left">
                <thead>
                  <tr className="border-b border-espresso-700/8 text-xs uppercase tracking-wide text-espresso-400">
                    <th className="px-5 py-3.5 font-semibold">Produto</th>
                    <th className="px-5 py-3.5 font-semibold">Categoria</th>
                    <th className="px-5 py-3.5 font-semibold">Preço</th>
                    <th className="px-5 py-3.5 font-semibold">Estoque</th>
                    <th className="px-5 py-3.5 font-semibold">Status</th>
                    <th className="px-5 py-3.5 font-semibold">Destaque</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-espresso-700/6">
                  {paged.map((p) => (
                    <tr key={p.id} className="transition-colors hover:bg-sand-50/60">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img src={p.images?.[0]} alt={p.name} className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-espresso-800">{p.name}</p>
                            <p className="text-xs text-espresso-400">{formatDate(p.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-espresso-600">{categoryName(p.category)}</td>
                      <td className="px-5 py-3.5 text-sm">
                        {p.promoPrice && p.promoPrice < p.price ? (
                          <div>
                            <span className="font-semibold text-espresso-800">{formatCurrency(p.promoPrice)}</span>
                            <span className="ml-1.5 text-xs text-espresso-400 line-through">{formatCurrency(p.price)}</span>
                          </div>
                        ) : (
                          <span className="font-semibold text-espresso-800">{formatCurrency(p.price)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-sm">
                        <span className={p.stock <= 3 ? 'font-semibold text-terracotta-600' : 'text-espresso-600'}>
                          {p.stock} un.
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button onClick={() => toggleProductStatus(p.id)}>
                          <StatusBadge status={p.status} />
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => toggleProductFlag(p.id, 'featured')}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                            p.featured ? 'bg-gold-400/20 text-gold-500' : 'text-espresso-300 hover:bg-sand-100'
                          }`}
                          title="Marcar como destaque"
                        >
                          <Star size={16} fill={p.featured ? 'currentColor' : 'none'} />
                        </button>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={`/produto/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-espresso-400 hover:bg-sand-100 hover:text-espresso-700"
                            title="Visualizar na loja"
                          >
                            <ExternalLink size={15} />
                          </a>
                          <Link
                            to={`/admin/produtos/${p.id}/editar`}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-espresso-400 hover:bg-sand-100 hover:text-espresso-700"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </Link>
                          <button
                            onClick={() => { duplicateProduct(p.id); notifySuccess('Produto duplicado.') }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-espresso-400 hover:bg-sand-100 hover:text-espresso-700"
                            title="Duplicar"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            onClick={() => setToDelete(p)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-espresso-400 hover:bg-terracotta-600/10 hover:text-terracotta-600"
                            title="Excluir"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-5">
              <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Excluir produto?"
        description={`Tem certeza que deseja excluir "${toDelete?.name}"? Essa ação não poderá ser desfeita.`}
        confirmLabel="Excluir produto"
        onConfirm={() => {
          deleteProduct(toDelete.id)
          notifySuccess('Produto excluído com sucesso.')
        }}
      />
    </div>
  )
}

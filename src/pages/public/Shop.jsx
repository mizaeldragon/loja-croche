import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, SlidersHorizontal, PackageSearch, X } from 'lucide-react'
import { useCatalogStore } from '../../store/useCatalogStore'
import ProductCard from '../../components/public/ProductCard'
import EmptyState from '../../components/ui/EmptyState'
import { ProductCardSkeleton } from '../../components/ui/Skeleton'
import Pagination from '../../components/ui/Pagination'

const SORT_OPTIONS = [
  { value: 'relevancia', label: 'Relevância' },
  { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' },
  { value: 'novidades', label: 'Novidades' },
]

const PAGE_SIZE = 8

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams()
  const products = useCatalogStore((s) => s.products)
  const categories = useCatalogStore((s) => s.categories)

  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('relevancia')
  const [page, setPage] = useState(1)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const activeCategory = searchParams.get('categoria') || ''

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => setPage(1), [query, sort, activeCategory])

  const filtered = useMemo(() => {
    let list = products.filter((p) => p.status === 'published')
    if (activeCategory) list = list.filter((p) => p.category === activeCategory)
    if (query.trim()) {
      const q = query.toLowerCase()
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || p.tags?.some((t) => t.toLowerCase().includes(q))
      )
    }
    const price = (p) => (p.promoPrice && p.promoPrice < p.price ? p.promoPrice : p.price)
    if (sort === 'menor-preco') list = [...list].sort((a, b) => price(a) - price(b))
    if (sort === 'maior-preco') list = [...list].sort((a, b) => price(b) - price(a))
    if (sort === 'novidades') list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    return list
  }, [products, activeCategory, query, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const setCategory = (slug) => {
    if (slug) setSearchParams({ categoria: slug })
    else setSearchParams({})
  }

  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="container-page">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <span className="eyebrow">Loja completa</span>
          <h1 className="mt-3 font-display text-3xl text-espresso-800 sm:text-4xl">Nossa coleção artesanal</h1>
          <p className="mt-3 text-sm text-espresso-500 sm:text-base">
            Encontre a peça perfeita entre roupas, acessórios, decoração e presentes feitos à mão.
          </p>
        </div>

        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-espresso-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome ou palavra-chave..."
              className="input-field pl-11"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFiltersOpen((o) => !o)}
              className="btn-secondary btn-sm sm:hidden"
            >
              <SlidersHorizontal size={14} /> Filtros
            </button>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field hidden w-auto sm:block">
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  Ordenar: {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={`mb-10 flex flex-wrap gap-2 ${filtersOpen ? 'flex' : 'hidden sm:flex'}`}>
          <button
            onClick={() => setCategory('')}
            className={`chip transition-colors ${!activeCategory ? '!bg-espresso-700 !text-cream-50 !border-espresso-700' : 'hover:bg-sand-100'}`}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={`chip transition-colors ${activeCategory === c.slug ? '!bg-espresso-700 !text-cream-50 !border-espresso-700' : 'hover:bg-sand-100'}`}
            >
              {c.name}
            </button>
          ))}
          {activeCategory && (
            <button onClick={() => setCategory('')} className="chip text-terracotta-600">
              <X size={12} /> Limpar
            </button>
          )}
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input-field ml-auto w-auto sm:hidden">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : paged.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Nenhuma peça encontrada"
            description="Tente ajustar sua busca ou explorar outras categorias do ateliê."
            action={
              <button onClick={() => { setQuery(''); setCategory('') }} className="btn-secondary btn-sm">
                Limpar filtros
              </button>
            }
          />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {paged.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
            <Pagination page={page} totalPages={totalPages} onChange={setPage} totalItems={filtered.length} pageSize={PAGE_SIZE} />
          </>
        )}
      </div>
    </section>
  )
}
